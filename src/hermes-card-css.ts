import { css } from 'lit';

/*
 * Card styles.
 *
 * The layout is a three-band vertical stack inside ha-card:
 *
 *   ┌───────────────────────────────┐
 *   │ header (auto)                 │
 *   ├───────────────────────────────┤
 *   │ global timeline (fixed)       │
 *   ├───────────────────────────────┤
 *   │ stage (flex:1, overflow auto) │
 *   │   - canvas sticky to top      │
 *   │   - spacer for native scrollbar
 *   └───────────────────────────────┘
 *
 * The card itself takes 100 % of whatever vertical space its
 * container hands it (masonry, sections grid, panel mode), with a
 * sensible min-height so a freshly-added card never paints into a
 * zero-pixel box.
 *
 * Theming is done via two sets of CSS custom properties switched
 * on the `.root` element (`.theme-dark` / `.theme-light`). All
 * surfaces, including the canvases via JS-side getComputedStyle,
 * pull their colours from these variables so the user can flip
 * the card from dark to light without restarting.
 */
export const hermesCardStyles = css`
    :host
    {
        display: block;
        width:   100%;
        height:  100%;
    }

    ha-card
    {
        position: relative;
        overflow: hidden;
        background: var(--hermes-bg-base, #0a0c10);
        color: var(--hermes-fg);
        border-radius: var(--ha-card-border-radius, 12px);
        font-family: var(--hermes-label-font);
        -webkit-font-smoothing: antialiased;
        width:      100%;
        height:     100%;
        min-height: 220px;
        /*  New stacking context so absolute children with z-index
            stay scoped to the card. */
        isolation: isolate;
        box-shadow:
            inset 0 0 0 1px var(--hermes-card-inset, rgba(255, 255, 255, 0.03)),
            inset 0 -40px 80px -40px var(--hermes-card-vignette, rgba(0, 0, 0, 0.6));
    }

    /*  Mini variant.
        The host gets a data-mini attribute in connectedCallback.
        Two things change versus the full card:
          - ha-card's min-height drops from 220 px to ~90 px so
            the card-picker preview cells and the sections-grid
            small slots don't overflow (this was what made the
            HA catalogue go haywire when both cards were
            registered).
          - The header tightens its padding so the card stays a
            slim strip when the user shrinks it down to one row.
        Everything else (height: 100 % cascade, flex layout)
        stays identical, so the strip still fills its container
        when there's room. */
    :host([data-mini]) ha-card
    {
        min-height: 90px;
    }

    :host([data-mini]) .header
    {
        padding: 8px 14px 4px 14px;
    }

    .root
    {
        display:        flex;
        flex-direction: column;
        width:          100%;
        height:         100%;
        min-height:     0;
        position:       relative;
        background:     var(--hermes-bg-grad, none);

        --hermes-label-font:
            ui-sans-serif, system-ui, -apple-system, "Segoe UI",
            "Inter", "Helvetica Neue", Arial, sans-serif;
        --hermes-mono-font:
            ui-monospace, SFMono-Regular, "SF Mono", Menlo,
            Consolas, "Liberation Mono", monospace;
    }

    /*  --- DARK theme (default) ---------------------------------- */
    .root.theme-dark
    {
        --hermes-bg-base:        #0a0c10;
        --hermes-bg-grad:        radial-gradient(120% 100% at 60% 0%, #0c0f15 0%, #07090c 100%);
        --hermes-card-inset:     rgba(255, 255, 255, 0.03);
        --hermes-card-vignette:  rgba(0, 0, 0, 0.6);
        --hermes-fg:             #e7ecf3;
        --hermes-fg-dim:         #9aa3b2;
        --hermes-fg-mute:        #5a6273;
        --hermes-rule:           rgba(255, 255, 255, 0.06);
        --hermes-rule-strong:    rgba(255, 255, 255, 0.12);
        --hermes-divider-tint:   rgba(255, 255, 255, 0.12);
        --hermes-tooltip-bg:     rgba(16, 19, 26, 0.92);
        --hermes-tooltip-bd:     rgba(255, 255, 255, 0.08);
        --hermes-scrollbar:      rgba(255, 255, 255, 0.14);
        --hermes-scrollbar-hov:  rgba(255, 255, 255, 0.24);
        --hermes-midline:        rgba(255, 255, 255, 0.05);
        --hermes-canvas-text:    rgba(255, 255, 255, 0.62);
        --hermes-canvas-mute:    rgba(255, 255, 255, 0.38);
    }

    /*  --- LIGHT theme ------------------------------------------- */
    .root.theme-light
    {
        --hermes-bg-base:        #f3f5f9;
        --hermes-bg-grad:        radial-gradient(120% 100% at 60% 0%, #ffffff 0%, #eef1f6 100%);
        --hermes-card-inset:     rgba(0, 0, 0, 0.04);
        --hermes-card-vignette:  rgba(0, 0, 0, 0.06);
        --hermes-fg:             #1a1d23;
        --hermes-fg-dim:         #4a5160;
        --hermes-fg-mute:        #8b94a5;
        --hermes-rule:           rgba(0, 0, 0, 0.05);
        --hermes-rule-strong:    rgba(0, 0, 0, 0.10);
        --hermes-divider-tint:   rgba(0, 0, 0, 0.10);
        --hermes-tooltip-bg:     rgba(255, 255, 255, 0.96);
        --hermes-tooltip-bd:     rgba(0, 0, 0, 0.08);
        --hermes-scrollbar:      rgba(0, 0, 0, 0.18);
        --hermes-scrollbar-hov:  rgba(0, 0, 0, 0.32);
        --hermes-midline:        rgba(0, 0, 0, 0.05);
        --hermes-canvas-text:    rgba(0, 0, 0, 0.70);
        --hermes-canvas-mute:    rgba(0, 0, 0, 0.42);
    }

    .header
    {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 18px 8px 18px;
    }

    .header .title
    {
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.02em;
        color: var(--hermes-fg);
    }

    .header .subtitle
    {
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--hermes-fg-mute);
    }

    .header .spacer
    {
        flex: 1;
    }

    .header .legend
    {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 10px;
        font-size: 10.5px;
        color: var(--hermes-fg-dim);
        max-width: 60%;
        justify-content: flex-end;
    }

    .header .legend .chip
    {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
    }

    .header .legend .swatch
    {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        box-shadow: 0 0 6px currentColor;
    }

    /*  Global timeline strip. In normal layout it has a fixed
        height set inline by the renderer; in mini-card mode it
        takes the whole available space (the stage is gone). */
    .global
    {
        flex: 0 0 auto;
        position: relative;
        width: 100%;
        overflow: hidden;
    }

    .global.mini
    {
        flex: 1 1 auto;
        /*  Reserve a baseline so the canvas always has somewhere
            to paint, even when ha-card's parent gives us zero
            height (e.g. inside the HA card-picker preview cell
            before it has measured us). */
        min-height: 50px;
    }

    .root.mini .header
    {
        padding-bottom: 4px;
    }

    .global canvas
    {
        display: block;
        width: 100%;
        height: 100%;
        position: absolute;
        inset: 0;
    }

    .divider
    {
        flex: 0 0 auto;
        height: 1px;
        background: linear-gradient(
            to right,
            transparent 0%,
            var(--hermes-divider-tint) 16%,
            var(--hermes-divider-tint) 84%,
            transparent 100%
        );
        margin: 0 12px;
    }

    /*  Main stage.
        Two stacked layers, both filling the stage box:
          - .stage-canvas-layer: an absolutely-positioned canvas,
            painted to the visible viewport, with pointer-events:
            none so it never swallows scroll wheel / touch / mouse
            events headed for the layer above.
          - .stage-scroll-layer: an overlay scroll container with
            overflow-y:auto, holding a single tall spacer that
            drives the scrollbar. All pointer events land here;
            the card translates the scrollTop into a render
            offset on the canvas below.
        This split is what the previous sticky-canvas approach
        was simulating, with none of the platform quirks that
        sometimes prevented vertical wheeling from kicking the
        scroll container. */
    .stage
    {
        flex: 1 1 auto;
        position: relative;
        width: 100%;
        min-height: 0;
    }

    .stage-canvas-layer
    {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    .stage-canvas-layer canvas
    {
        display: block;
        width: 100%;
        height: 100%;
    }

    .stage-scroll-layer
    {
        position: absolute;
        inset: 0;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-color: var(--hermes-scrollbar) transparent;
        /*  Tell touch UAs that vertical pan is the only gesture
            we want; the canvas hit-tests itself for hover, no
            need for pinch-zoom / horizontal swipe defaults. */
        touch-action: pan-y;
    }

    .stage-scroll-layer::-webkit-scrollbar
    {
        width: 8px;
    }

    .stage-scroll-layer::-webkit-scrollbar-track
    {
        background: transparent;
    }

    .stage-scroll-layer::-webkit-scrollbar-thumb
    {
        background: var(--hermes-scrollbar);
        border-radius: 6px;
    }

    .stage-scroll-layer::-webkit-scrollbar-thumb:hover
    {
        background: var(--hermes-scrollbar-hov);
    }

    .stage-spacer
    {
        width: 100%;
        /*  Inline height set by the renderer. The 1px floor
            avoids the scrollbar flashing when there are no
            lanes yet. */
        height: 1px;
    }

    .tooltip
    {
        position: absolute;
        z-index: 5;
        pointer-events: none;
        background: var(--hermes-tooltip-bg);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid var(--hermes-tooltip-bd);
        border-radius: 10px;
        padding: 8px 10px;
        min-width: 140px;
        max-width: 280px;
        font-size: 11.5px;
        line-height: 1.35;
        color: var(--hermes-fg);
        box-shadow:
            0 8px 24px rgba(0, 0, 0, 0.45),
            0 0 0 1px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transition: opacity 90ms ease-out;
    }

    .tooltip.visible
    {
        opacity: 1;
    }

    /*  Tooltip placement variants. The transform is what positions
        the bubble relative to the (x, y) anchor: above the ping
        by default, below it when the anchor is too close to the
        top of the card. */
    .tooltip.above
    {
        transform: translate(-50%, calc(-100% - 10px));
    }

    .tooltip.below
    {
        transform: translate(-50%, 14px);
    }

    .tooltip .tt-name
    {
        font-weight: 600;
        margin-bottom: 2px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .tooltip .tt-id
    {
        font-family: var(--hermes-mono-font);
        font-size: 10px;
        color: var(--hermes-fg-mute);
        margin-bottom: 6px;
        word-break: break-all;
    }

    .tooltip .tt-row
    {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        color: var(--hermes-fg-dim);
        font-size: 11px;
    }

    .tooltip .tt-row .label
    {
        color: var(--hermes-fg-mute);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-size: 10px;
    }

    .tooltip .tt-row .value
    {
        font-family: var(--hermes-mono-font);
        color: var(--hermes-fg);
        text-align: right;
        word-break: break-all;
    }

    .tooltip .tt-arrow
    {
        position: absolute;
        left: calc(50% + var(--hermes-arrow-offset, 0px));
        transform: translateX(-50%) rotate(45deg);
        width: 8px;
        height: 8px;
        background: var(--hermes-tooltip-bg);
    }

    .tooltip.above .tt-arrow
    {
        bottom: -5px;
        border-right: 1px solid var(--hermes-tooltip-bd);
        border-bottom: 1px solid var(--hermes-tooltip-bd);
    }

    .tooltip.below .tt-arrow
    {
        top: -5px;
        border-left: 1px solid var(--hermes-tooltip-bd);
        border-top:  1px solid var(--hermes-tooltip-bd);
    }

    .empty
    {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: var(--hermes-fg-mute);
        font-size: 12px;
        pointer-events: none;
        text-align: center;
        padding: 0 24px;
    }

    .empty .pulse
    {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--hermes-fg-mute);
        margin-bottom: 8px;
        animation: hermes-pulse 1.6s ease-in-out infinite;
    }

    @keyframes hermes-pulse
    {
        0%, 100% { opacity: 0.3; transform: scale(1);   }
        50%      { opacity: 0.9; transform: scale(1.6); }
    }
`;
