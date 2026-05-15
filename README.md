# ⚡ HERMES

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![HA-CustomCard](https://img.shields.io/badge/Home%20Assistant-Custom%20Card-blue)](https://github.com/custom-cards/boilerplate-card)

**HERMES** is a custom [Home Assistant](https://www.home-assistant.io/) Lovelace card that shows the **pulse of your home** in real time. Every entity state change drops a coloured sphere onto a horizontal timeline that drifts from right to left, so a glance is enough to know what's happening, what just happened, and which corner of your installation is alive.

It's a companion piece to [HELIOS](https://github.com/ReikanYsora/Helios): same minimalist, dark-first aesthetic, but instead of the sun it watches every sensor you point it at.

---

## At a glance

* **One sphere per state change**, dropped at the right edge the instant Home Assistant emits `state_changed`, then drifting left across the visible window.
* **Colour by channel**, the palette groups domains into 17 visual families (binary, numeric, light, switch, climate, presence, weather, system, …) so the screen reads as a domain heatmap, not a wall of dots.
* **Size by magnitude**, big swings produce bigger spheres. Numeric sensors are graded against their own rolling baseline so a `0.1 °C` flutter from a noisy thermometer stays quiet while a sudden jump still pops.
* **Stable lanes**, each entity claims a horizontal lane on first sight and keeps it. The timeline never reshuffles under your eyes.
* **Hover for context**, a discreet tooltip surfaces the entity friendly name, its current and previous value (with unit when available) and how long ago the change happened.
* **Live legend**, only the channels that actually emitted a ping in the current session appear in the header, so the chrome stays quiet on lightly used dashboards.
* **Lightweight**, single bundled ES module, no external CDN, no map, no WebGL. The renderer is a plain `<canvas>` with a `ResizeObserver`, so the card scales naturally to any HA layout (sidebar, grid, panel) and stays smooth on low-end devices.

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
height: 360
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
| `timespan_seconds` | int | `300` | Width of the visible window. A sphere takes this long to cross from right to left. |
| `height` | int | `320` | Card height in pixels. Hermes resizes the stage to fit. |
| `label_width` | int | `168` | Left gutter width for entity labels. Set to `0` (or `show_labels: false`) to hide the gutter. |
| `show_legend` | bool | `true` | Show the per-channel legend in the header. Only emitting channels appear. |
| `show_last_value` | bool | `true` | Show each entity's current state next to its label. |
| `max_pings` | int | `2000` | Hard cap on retained pings (safety net against runaway emitters). |
| `ignore_unavailable` | bool | `true` | Drop pings whose transition is just `unavailable` / `unknown` ↔ value. |
| `entities` | list | – | Explicit list. Supports glob patterns (`light.*`, `sensor.*_temperature`). When set, only listed entities are tracked. |
| `include_domains` | list | sensible default | Domain allow-list, used only when `entities` is empty. |
| `exclude_entities` | list | – | Hard blocklist applied after the include rules. |
| `exclude_domains` | list | – | Domain blocklist applied after the include rules. |

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
