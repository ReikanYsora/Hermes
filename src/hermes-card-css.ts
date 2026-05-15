import { css } from 'lit';

/*
 * Card styles.
 *
 * Kept in one file (rather than next to the component) so the
 * editor and any future variants can pick up the same visual
 * language without copy-pasting selectors. All sizes flex with
 * the parent ha-card; nothing here is pinned in pixels except
 * a few minimums that protect readability on tiny mobile cards.
 *
 * The look is intentionally restrained: near-black surface, soft
 * grain, low-contrast scaffolding, all the colour comes from the
 * pings the engine emits.
 */
export const hermesCardStyles = css`
    :host
    {
        display: block;
        --hermes-bg:           #0a0c10;
        --hermes-bg-grad-1:    #0c0f15;
        --hermes-bg-grad-2:    #07090c;
        --hermes-fg:           #e7ecf3;
        --hermes-fg-dim:       #9aa3b2;
        --hermes-fg-mute:      #5a6273;
        --hermes-rule:         rgba(255, 255, 255, 0.06);
        --hermes-rule-strong:  rgba(255, 255, 255, 0.12);
        --hermes-tooltip-bg:   rgba(16, 19, 26, 0.92);
        --hermes-tooltip-bd:   rgba(255, 255, 255, 0.08);
        --hermes-label-font:
            ui-sans-serif, system-ui, -apple-system, "Segoe UI",
            "Inter", "Helvetica Neue", Arial, sans-serif;
        --hermes-mono-font:
            ui-monospace, SFMono-Regular, "SF Mono", Menlo,
            Consolas, "Liberation Mono", monospace;
    }

    .root
    {
        position: relative;
        width: 100%;
        background: radial-gradient(
            120% 100% at 60% 0%,
            var(--hermes-bg-grad-1) 0%,
            var(--hermes-bg-grad-2) 100%
        );
        color: var(--hermes-fg);
        border-radius: var(--ha-card-border-radius, 14px);
        overflow: hidden;
        font-family: var(--hermes-label-font);
        -webkit-font-smoothing: antialiased;
        box-shadow:
            inset 0 0 0 1px rgba(255, 255, 255, 0.03),
            inset 0 -40px 80px -40px rgba(0, 0, 0, 0.6);
    }

    .header
    {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 18px 10px 18px;
        border-bottom: 1px solid var(--hermes-rule);
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
        gap: 6px 10px;
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

    .stage
    {
        position: relative;
        width: 100%;
        /* Default min height; the card resizes to host's height. */
        min-height: 220px;
    }

    canvas
    {
        display: block;
        width: 100%;
        height: 100%;
        position: absolute;
        inset: 0;
    }

    .tooltip
    {
        position: absolute;
        z-index: 3;
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
        transform: translate(-50%, calc(-100% - 10px));
        opacity: 0;
        transition: opacity 90ms ease-out;
    }

    .tooltip.visible
    {
        opacity: 1;
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
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
        width: 8px;
        height: 8px;
        background: var(--hermes-tooltip-bg);
        border-right: 1px solid var(--hermes-tooltip-bd);
        border-bottom: 1px solid var(--hermes-tooltip-bd);
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

    /* Editor scaffolding kept here so it shares the same surface
       look as the card itself. */
    .editor
    {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px 0;
        font-family: var(--hermes-label-font);
    }

    .editor .row
    {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .editor .row > label
    {
        font-size: 12px;
        color: var(--secondary-text-color, #aaa);
    }

    .editor .row input,
    .editor .row textarea
    {
        background: var(--card-background-color, #1c1f24);
        color: var(--primary-text-color, #eee);
        border: 1px solid var(--divider-color, #333);
        border-radius: 8px;
        padding: 8px 10px;
        font: inherit;
    }

    .editor .row textarea
    {
        min-height: 84px;
        resize: vertical;
        font-family: var(--hermes-mono-font);
        font-size: 12px;
    }

    .editor .hint
    {
        font-size: 11px;
        color: var(--secondary-text-color, #aaa);
        line-height: 1.4;
    }
`;
