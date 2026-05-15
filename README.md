# ⚡ HERMES

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![HA-CustomCard](https://img.shields.io/badge/Home%20Assistant-Custom%20Card-blue)](https://github.com/custom-cards/boilerplate-card)

**HERMES** is a custom [Home Assistant](https://www.home-assistant.io/) Lovelace card that shows the **pulse of your home** in real time. Every entity state change drops a coloured sphere onto a horizontal timeline that drifts from right to left, so a glance is enough to know what's happening, what just happened, and which corner of your installation is alive.

It's a companion piece to [HELIOS](https://github.com/ReikanYsora/Helios): same minimalist aesthetic, light **or** dark theme, but instead of the sun it watches every sensor you point it at.

Two cards ship in the same bundle:

* **`custom:hermes-card`** — the full activity map: header, global activity strip, divider, scrollable per-entity stage.
* **`custom:hermes-mini-card`** — the global strip on its own, ideal as a one-or-two-row chip in a sections dashboard.

---

## At a glance

* **Two timelines, one card**. A fast "guitar-hero" global strip at the top condenses every entity onto a single track, with sphere size scaling logarithmically against how often that entity has fired since the card was mounted. Below it, a slower per-entity stage assigns each entity its own lane.
* **One sphere per state change**, dropped at the right edge the instant Home Assistant emits `state_changed`, then drifting left across the visible window.
* **Colour by channel**, the palette groups domains into 17 visual families (binary, numeric, light, switch, climate, presence, weather, system, …) so the screen reads as a domain heatmap, not a wall of dots.
* **Size by magnitude**, big swings produce bigger spheres. Numeric sensors are graded against their own rolling baseline so a `0.1 °C` flutter from a noisy thermometer stays quiet while a sudden jump still pops.
* **Stable lanes + native scroll**, each entity claims a horizontal lane on first sight and keeps it; once you exceed what fits, the stage scrolls vertically with the canvas sticky to the top. The timeline never reshuffles under your eyes.
* **Two-column labels**, name on the left, current value on the right, in separate fixed-width columns so a long entity name can never paint over its value.
* **Hover for context**, a discreet tooltip surfaces the entity friendly name, the value it had at that exact moment, its previous value, how long ago the change happened, and (on the global strip) how many times this entity has changed since the card was mounted.
* **Live legend**, only the channels that actually emitted a ping in the current session appear in the header, so the chrome stays quiet on lightly used dashboards.
* **Dynamic sizing**, the card stretches to fill whatever its container hands it (sections grid, masonry, panel). No `height` knob in YAML.
* **Light or dark theme**, switchable from the visual editor. Both surfaces are theme-aware down to the canvas (lane labels, midline, scrollbar all read from the live CSS variables).
* **Multilingual**, English, French, German, Spanish, Italian, Dutch, Portuguese. Adapts to your Home Assistant language.
* **Lightweight**, single bundled ES module, no external CDN, no map, no WebGL. Two plain `<canvas>` elements with a `ResizeObserver`, smooth on low-end devices.

---

## Installation via HACS

### Custom repository (recommended for now)

1. Open HACS → click the three-dot menu → **Custom repositories**.
2. Add this repository: `https://github.com/ReikanYsora/Hermes`
3. Set category to **Dashboard**.
4. Install **HERMES** from the dashboard list.
5. Reload your browser.
6. Add the card to your dashboard:
   ```yaml
   type: custom:hermes-card
   ```

### Manual installation

1. Download `hermes.js` from the latest [release](https://github.com/ReikanYsora/Hermes/releases).
2. Copy it to `<config>/www/community/hermes/`.
3. Add the resource to your dashboard:
   ```yaml
   url: /local/community/hermes/hermes.js
   type: module
   ```

---

## Configuration

The visual editor exposes every option. Minimal config:

```yaml
type: custom:hermes-card
```

That's it: no key, no entity list. Hermes will pick up every entity in the default allow-list and start drawing.

A more curated example:

```yaml
type: custom:hermes-card
title: Ground floor
timespan_seconds: 600
global_timespan_seconds: 45
entities:
  - binary_sensor.motion_*
  - light.kitchen
  - light.living_room
  - sensor.temperature_outdoor
  - sensor.power_main
exclude_entities:
  - sensor.last_seen_router
```

| Key | Type | Default | Description |
|---|---|---|---|
| `title` | string | `Activity` | Header text on the top-left. |
| `card_theme` | `'dark' \| 'light'` | `'dark'` | Card chrome skin. Flips background, label colour, canvas text and scrollbar tint between the dark and light theme via CSS variables. |
| `timespan_seconds` | int | `300` | Width of the per-entity stage window. A sphere takes this long to cross from right to left in the lower stage. |
| `global_timespan_seconds` | int | `60` | Width of the top global strip window. Shorter than `timespan_seconds` to produce the fast "guitar-hero" rhythm. |
| `global_height` | int | `72` | Vertical height of the top global strip in pixels. |
| `show_global` | bool | `true` | Show the top global activity strip. |
| `label_width` | int | `150` | Width of the name column in the lower stage. Set to `0` (or `show_labels: false`) to hide both columns. |
| `value_width` | int | `64` | Width of the (right-aligned) value column. Reserved separately from `label_width` so a long name never paints over the value. |
| `show_legend` | bool | `true` | Show the per-channel legend in the header. Only emitting channels appear. |
| `show_last_value` | bool | `true` | Show each entity's current state in the value column. |
| `max_pings` | int | `2000` | Hard cap on retained pings (safety net against runaway emitters). |
| `ignore_unavailable` | bool | `true` | Drop pings whose transition is just `unavailable` / `unknown` ↔ value. |
| `entities` | list | – | Explicit list. Supports glob patterns (`light.*`, `sensor.*_temperature`). When set, only listed entities are tracked. |
| `include_domains` | list | sensible default | Domain allow-list, used only when `entities` is empty. |
| `exclude_entities` | list | – | Hard blocklist applied after the include rules. |
| `exclude_domains` | list | – | Domain blocklist applied after the include rules. |

> **Sizing.** Hermes fills its container vertically (sections grid, masonry, panel). To make it bigger, resize the card from the dashboard, not from YAML.

### Channel palette

| Channel | Domains | Hue |
|---|---|---|
| Binary | `binary_sensor` | cobalt |
| Numeric | `sensor` (numeric) | coral |
| Text | `sensor` (string), `input_text`, `input_select` | lavender |
| Switch | `switch`, `input_boolean` | emerald |
| Light | `light` | amber |
| Climate | `climate`, `water_heater` | orange |
| Cover | `cover`, `garage_door` | cyan |
| Lock | `lock` | rose |
| Media | `media_player`, `remote` | pink |
| Presence | `person`, `device_tracker`, `zone` | violet |
| Weather | `weather`, `sun` | gold |
| Automation | `automation`, `script`, `scene` | teal |
| Trigger | `button`, `input_button`, `event` | lime |
| Alarm | `alarm_control_panel`, `siren` | crimson |
| Appliance | `vacuum`, `fan`, `humidifier` | sky |
| Update | `update` | magenta |
| Input | `input_number`, `counter`, `number`, `timer` | pastel violet |
| Other | anything else | slate |

---

## How it works

* Hermes subscribes to the Home Assistant WebSocket `state_changed` event bus on mount.
* Each accepted event is converted into a **ping**: an entity id, the previous and current state, a channel-coloured hue and a magnitude in `[0..1]`.
* Pings live in a bounded ring buffer; the renderer reads a snapshot once per frame, drops pings older than `timespan_seconds`, and paints the survivors with `requestAnimationFrame`.
* Lanes are first-come-first-served and stable: the first time an entity emits, it claims the next free lane, and that lane never moves.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the deeper map.

---

## Roadmap

* Click-to-pin tooltip
* Drag-to-pan in the past (history backfill from HA recorder)
* Persistent lane ordering across reloads
* Optional grouping mode (one lane per channel instead of per entity)

---

## License

[MIT](LICENSE) © ReikanYsora
