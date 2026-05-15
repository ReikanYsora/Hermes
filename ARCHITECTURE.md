# Hermes — architecture

A short tour of the pieces, in the order they execute when a Home Assistant dashboard mounts a Hermes card.

```
+-------------------+        +-----------------+        +-----------------+
|  HA WebSocket     |        |  HermesEngine   |        |  HermesCard     |
|  state_changed    | -----> |  ring buffer +  | -----> |  canvas render  |
|  event stream     |        |  per-entity     |        |  + tooltip      |
+-------------------+        |  stats + lanes  |        +-----------------+
                             +-----------------+                ^
                                                                |
                                                          requestAnimationFrame
```

## Source layout

| File | Role |
|---|---|
| `src/hermes-card.ts` | Lit element `<hermes-card>`. Owns the engine instance, the canvas, the animation loop and the tooltip. The Lovelace entry point. |
| `src/hermes-engine.ts` | Subscribes to `state_changed`, applies the YAML filters, converts each accepted change into a `Ping`, maintains the lane registry. No DOM. |
| `src/hermes-types.ts` | Type system: channels, palette, magnitude grading, colour helpers. Pure functions, trivially testable. |
| `src/hermes-card-css.ts` | All card styles as a single `lit-css` block. |
| `src/hermes-config.ts` | `<hermes-card-editor>` Lit element returned by `HermesCard.getConfigElement()`. |
| `src/i18n/` | Tiny translation table (en, fr) with a primary-subtag resolver. |

## Data flow

1. `setConfig(yamlConfig)` is called by HA. We resolve it (defaults + clamps), instantiate the engine on first call or push the new filters into the existing engine on later calls. Either way, the YAML never reaches the renderer directly: the resolved shape is the single source of truth.

2. `connectedCallback` starts `requestAnimationFrame` and (via `updated`) wires up the `<canvas>`, the `ResizeObserver` and the mouse / touch listeners.

3. HA hands us a fresh `hass` whenever any state changes. We re-bind the engine only when the `hass` *instance* changes (i.e. WebSocket reconnect). Within the same connection, the engine's own subscription already sees every event, so we don't need to react on the property push.

4. `HermesEngine.handleStateChanged` filters, computes a magnitude against the entity's running stats, pushes a `Ping` into the bounded ring buffer, and notifies listeners. The card sets `dirty = true` so the next frame draws.

5. `paint()` (rAF callback) reads `engine.getSnapshot()`, computes lane geometry, draws the dashed lane tracks, then iterates pings oldest-first and paints each as a glowing sphere. While drawing, it hit-tests the cursor against every visible sphere and keeps the closest match for the tooltip.

## Filter rules

The accept predicate, in order:

1. Hard excludes (`exclude_entities`, `exclude_domains`) — always win.
2. If `entities` is set (explicit list or glob), match against it. Otherwise, fall back to `include_domains` and accept entities whose domain is in the allow-list.

`ignore_unavailable` (on by default) drops any change where either side of the transition is `null` / `''` / `unavailable` / `unknown`. These are connectivity blips that would otherwise flood the timeline whenever an integration restarts.

## Magnitude

`magnitudeFor` returns a number in `[0..1]` that the renderer multiplies into the sphere radius. The rules:

* **Toggle channels** (`binary`, `switch`, `light`, `lock`, `cover`, `alarm`): `0.85` when the new state is "on-like", `0.4` otherwise. Gives the timeline a clear visual rhythm for on/off events.
* **Numeric channels** (`numeric`, `input`): `|delta|` is normalised against a per-entity exponentially-weighted mean of past `|delta|`s. The result is fed through `1 - exp(-r)` so extreme jumps saturate gracefully instead of overflowing the lane.
* **Everything else**: a flat `0.65`. Triggers, presence, weather etc. don't carry a meaningful magnitude.

The EMA uses `alpha = 0.15`, which corresponds to a half-life of ~5 observations — short enough to react when an entity changes regime, long enough that a single outlier doesn't shrink everything that follows.

## Lane assignment

Lanes are first-come-first-served. When an entity emits for the first time, it claims `nextLaneIndex++`, and that slot is reserved forever. The renderer sorts by `laneIndex` per frame so the on-screen order matches insertion order. Stable layout matters: re-ordering on every ping would make the screen impossible to read.

A future option may sort by *recent activity* instead — see the roadmap.

## Rendering

Canvas, not SVG. The card commonly has 100–500 visible spheres at once and re-paints them every frame. Canvas wins on both bandwidth (no DOM diff) and CPU.

Each sphere is three layers:

1. A radial-gradient **halo** drawn with `globalCompositeOperation = 'lighter'`, so overlapping pings naturally brighten.
2. A solid **body** at ~95 % alpha.
3. A bright **pinprick highlight** off-centre to suggest a 3D sphere.

The halo, body and highlight all fade together over the *last 18 %* of the timespan, so pings dissolve gently into the left edge instead of clipping abruptly.

## Animation loop

`requestAnimationFrame` runs continuously while the card is connected. We don't try to be clever about when to stop: with `< 1000` pings per frame the canvas work is microseconds, and the alternative (start/stop based on activity) adds bugs around the empty-state and tooltip without saving anything measurable.

The render is throttled implicitly by `requestAnimationFrame`'s 60 Hz cap; on background tabs the browser drops it to ~1 Hz and the card pauses for free.

## Hit testing

The cursor's `(x, y)` is captured per `mousemove` and the render compares it against every visible sphere. Best-match (closest centre within `r + HIT_RADIUS_PAD`) wins the tooltip. Linear scan: at ~500 spheres per frame it's a sub-microsecond loop.

Tooltips are HTML overlays, not canvas: HA users expect text to be selectable and screen-reader-friendly, and the canvas alternative would mean re-implementing focus rings and accessibility from scratch.

## Adding a new channel

1. Add a member to the `Channel` union in `hermes-types.ts`.
2. Add a hue in `CHANNEL_COLOR` and a label in `CHANNEL_LABEL`.
3. Map at least one domain to it in `DOMAIN_CHANNEL`.
4. (Optional) Extend `magnitudeFor` if the channel needs its own grading rule.

That's it: the renderer and the engine read everything from the type module.
