import { LitElement, html, PropertyValues, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import
{
    CHANNEL_COLOR,
    CHANNEL_LABEL,
    type Channel,
    type HexColor
} from './hermes-types';
import
{
    HermesEngine,
    type HermesEngineConfig,
    type HassLike,
    type Ping,
    type Lane,
    DEFAULT_INCLUDE_DOMAINS,
    HERMES_VERSION
} from './hermes-engine';
import { hermesCardStyles } from './hermes-card-css';
//Side-effect import: registers <hermes-card-editor> as a custom
//element so the Lovelace visual editor can find it.
import './hermes-config';
import { pickTranslations, type Translation } from './i18n';

//Card name and description in the HA card picker, shown before any
//hass instance is available, so we read the language from navigator.
const _bootI18n = pickTranslations(typeof navigator !== 'undefined' ? navigator.language : 'en');

declare global
{
    interface Window
    {
        customCards?: Array<{
            type:        string;
            name:        string;
            description: string;
            preview?:    boolean;
        }>;
    }
}

window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === 'hermes-card'))
{
    window.customCards.push(
    {
        type:        'hermes-card',
        name:        _bootI18n.cardName,
        description: _bootI18n.cardDescription,
        preview:     true
    });
}
if (!window.customCards.some(c => c.type === 'hermes-mini-card'))
{
    window.customCards.push(
    {
        type:        'hermes-mini-card',
        name:        _bootI18n.miniCardName,
        description: _bootI18n.miniCardDescription,
        preview:     true
    });
}

//Install banner. The `❋` glyph (U+274B HEAVY EIGHT TEARDROP
//PROPELLER ASTERISK) sits in the Dingbats block: monochrome,
//near-universal font coverage, and visually rendered at about
//the same horizontal advance as a wide capital letter, so the
//"❋ HERMES" left chip lines up width-wise with siblings that
//use a similarly weighted dingbat. The eight teardrops radiating
//from the centre also riff on the winged-messenger theme of the
//card without resorting to an emoji.
{
    const flagKey = '__hermesBannerPrinted';
    const w = window as unknown as Record<string, unknown>;
    if (!w[flagKey])
    {
        w[flagKey] = true;
        const labelStyle   = 'background:#8b5cf6;color:#1f2937;padding:2px 8px;border-radius:4px 0 0 4px;font-weight:bold;';
        const versionStyle = 'background:#1f2937;color:#8b5cf6;padding:2px 8px;border-radius:0 4px 4px 0;font-weight:bold;';
        console.info(
            `%c❋ HERMES%c v${HERMES_VERSION}`,
            labelStyle,
            versionStyle
        );
        console.info(
            `%c❋ HERMES%c watching every entity state change on this dashboard`,
            labelStyle,
            'color:#6b7280;font-style:italic;'
        );
    }
}

//YAML config exposed to users. Everything optional, everything
//has a sensible default. The visual editor mirrors this list.
//
//`height` is intentionally absent: the card stretches to fill
//whatever its container hands it. Users size Hermes via the
//sections grid / masonry / panel layout in HA itself, not from
//the card YAML.
//
//`type` accepts both the full card (`custom:hermes-card`) and the
//mini variant (`custom:hermes-mini-card`). The mini variant is a
//thin subclass that ships in the same bundle: it inherits the
//engine, the colour palette, the editor and the i18n, but drops
//the per-entity stage and renders only the global strip. Picking
//the mini variant in the HA card store is the user-facing toggle.
export interface HermesCardConfig
{
    type:                     'custom:hermes-card' | 'custom:hermes-mini-card';
    card_theme?:              'dark' | 'light';
    title?:                   string;
    timespan_seconds?:        number;
    global_timespan_seconds?: number;
    global_height?:           number;
    label_width?:             number;   //pixels, name column width
    value_width?:             number;   //pixels, value column width (right of name)
    show_labels?:             boolean;
    show_legend?:             boolean;
    show_last_value?:         boolean;
    show_global?:             boolean;
    max_pings?:               number;
    ignore_unavailable?:      boolean;
    entities?:                string[];
    include_domains?:         string[];
    exclude_entities?:        string[];
    exclude_domains?:         string[];
}

interface ResolvedConfig
{
    title:               string;
    theme:               'dark' | 'light';
    timespanSeconds:     number;
    globalTimespanSeconds: number;
    globalHeight:        number;
    labelWidth:          number;
    valueWidth:          number;
    showLegend:          boolean;
    showLastValue:       boolean;
    showGlobal:          boolean;
    maxPings:            number;
    ignoreUnavailable:   boolean;
    entities?:           string[];
    includeDomains?:     string[];
    excludeEntities?:    string[];
    excludeDomains?:     string[];
}

interface TooltipState
{
    visible:    boolean;
    x:          number;       //clamped bubble centre, in .root coords
    y:          number;       //bubble anchor (sphere centre), in .root coords
    place:      'above' | 'below';  //orientation relative to anchor
    arrowOffset: number;      //px shift of the arrow from bubble centre
    pingId:     number;
    showCount:  boolean;      //true when tooltip is sourced from the global strip
    name:       string;
    entityId:   string;
    value:      string;
    previous:   string;
    ago:        string;
    count:      number;
    color:      HexColor;
}

const EMPTY_TOOLTIP: TooltipState =
{
    visible:     false,
    x:           0,
    y:           0,
    place:       'above',
    arrowOffset: 0,
    pingId:      0,
    showCount:   false,
    name:        '',
    entityId:    '',
    value:       '',
    previous:    '',
    ago:         '',
    count:       0,
    color:       '#94A3B8'
};

//Layout constants. The lane pitch is fixed (not stretched to
//fill the stage) so the visual rhythm stays steady regardless of
//how many entities are tracked; once the entities overflow, the
//stage scrolls.
const STAGE_PAD_TOP    = 6;
const STAGE_PAD_BOTTOM = 6;
const STAGE_PAD_RIGHT  = 18;
const LANE_PITCH       = 30;
const LANE_INNER       = 26;     //usable height inside a lane (sphere reach)
const HIT_RADIUS_PAD   = 6;
const FADE_TAIL_FRAC   = 0.18;

const GLOBAL_PAD_X     = 18;
const GLOBAL_INNER_PAD = 8;      //top/bottom padding inside the global strip

//Maximum replay speed when catching up from a pause. 6x means
//one minute of pause replays in ten seconds before the timeline
//snaps back to live. Slow enough that the user can still follow
//each ping; fast enough to feel responsive.
const CATCH_UP_SPEED   = 6;

//Below this absolute gap (ms) between renderNow and Date.now()
//we consider the timeline back at live and stop the fast-
//forward. Cheap snap so we don't accumulate floating-point
//drift across long sessions.
const LIVE_EPSILON_MS  = 60;

//Tooltip width / height estimates used for viewport clamping.
//These match the CSS min/max budgets in hermes-card-css.ts; if
//the tooltip overflows in practice (very long entity names),
//`max-width: 280px` in CSS caps the bubble and the arrow stays
//close to its anchor via the CSS variable below.
const TOOLTIP_HALF_W   = 110;
const TOOLTIP_H        = 110;
const TOOLTIP_MARGIN   = 8;

//Compact tooltip used in mini-card mode: only the entity name
//and the current value land in the bubble, so it shrinks enough
//to fit comfortably above or below a thin strip card without
//tripping ha-card's overflow clip. Half-width matches the
//slimmer max-width applied by .tooltip.mini in the stylesheet.
const TOOLTIP_HALF_W_MINI = 90;
const TOOLTIP_H_MINI      = 58;

//Resolved palette for the canvas drawing layer, mirroring the
//theme CSS variables. Read once per frame from getComputedStyle
//so flipping the theme reskins the canvas on the next paint.
interface CanvasPalette
{
    text:    string;
    mute:    string;
    midline: string;
}

const DEFAULT_PALETTE: CanvasPalette =
{
    text:    'rgba(255,255,255,0.62)',
    mute:    'rgba(255,255,255,0.38)',
    midline: 'rgba(255,255,255,0.05)'
};

//Two-column label gutter geometry. The columns themselves have
//no visible separator, but their widths are reserved so the value
//can never paint into the name's text box, no matter how long the
//name is.
const LABEL_DOT_X      = 12;
const LABEL_DOT_R      = 3.2;
const LABEL_TEXT_START = 22;     //LABEL_DOT_X + LABEL_DOT_R + small gap
const LABEL_COL_GAP    = 10;     //space between name col and value col
const VALUE_RIGHT_PAD  = 10;     //inner right padding so the value never kisses the lane

@customElement('hermes-card')
export class HermesCard extends LitElement
{
    static override styles = hermesCardStyles;

    @property({ attribute: false }) hass?: HassLike;

    @state() private _config: ResolvedConfig = resolveConfig({ type: 'custom:hermes-card' });
    @state() private _tooltip: TooltipState = EMPTY_TOOLTIP;
    @state() private _entityCount = 0;
    @state() private _i18n: Translation = _bootI18n;
    @state() private _paused = false;

    //Renderer-driven time cursor. Normally tracks Date.now(); when
    //the user pauses, it freezes at the pause instant; when the
    //user un-pauses with a gap to close, it advances faster than
    //real time until it catches up. Engine eviction is keyed off
    //this value, so pings that arrive while paused stay in the
    //buffer waiting to be replayed.
    private _renderNow: number = Date.now();
    private _lastRafTime: number = 0;

    private engine: HermesEngine | null = null;
    private engineUnsubscribe: (() => void) | null = null;

    //DOM handles, wired in updated() once the shadow root has
    //rendered.
    private rootEl: HTMLDivElement | null = null;
    private stageEl: HTMLDivElement | null = null;
    private stageCanvas: HTMLCanvasElement | null = null;
    private stageCtx: CanvasRenderingContext2D | null = null;
    private scrollEl: HTMLDivElement | null = null;
    private globalEl: HTMLDivElement | null = null;
    private globalCanvas: HTMLCanvasElement | null = null;
    private globalCtx: CanvasRenderingContext2D | null = null;
    private spacerEl: HTMLDivElement | null = null;
    private resizeObserver: ResizeObserver | null = null;

    private rafHandle: number = 0;
    private dirty = true;

    //Mouse coords kept per-canvas so the hit-test of each strip
    //runs against the cursor inside its own frame.
    private stageMouse: { x: number; y: number } = { x: -1, y: -1 };
    private globalMouse: { x: number; y: number } = { x: -1, y: -1 };

    private stageScrollY = 0;

    //Sticky ping ids per strip. Once the cursor hits a ping, we
    //pin the tooltip to that ping's id and keep showing its info
    //even as the ping slides leftward away from the cursor; the
    //tooltip is released only when the cursor leaves the canvas
    //(or, for the stage, drifts vertically out of the ping's
    //lane). Without this, a ping moving at ~30 px/s slips out of
    //the hit zone in under a second and the tooltip flickers off
    //even though the user is still hovering "the same place".
    //Zero means "no current lock".
    private _stickyStagePingId  = 0;
    private _stickyGlobalPingId = 0;

    //Backing-store sizes, in CSS px, recomputed by the resize
    //observer.
    private stageW = 0;
    private stageH = 0;
    private globalW = 0;
    private globalH = 0;
    private dpr = 1;

    //----- HA card contract -----

    static getConfigElement(): HTMLElement
    {
        return document.createElement('hermes-card-editor');
    }

    static getStubConfig(): HermesCardConfig
    {
        return {
            type:             'custom:hermes-card',
            title:            'Activity',
            timespan_seconds: 300
        };
    }

    //Stub config for the mini variant. Surfaced through
    //HermesMiniCard.getStubConfig() so the HA card picker
    //preview matches what the user will actually paint. Public
    //so the subclass static can call it without going through
    //a cast.
    static miniStubConfig(): HermesCardConfig
    {
        return {
            type:                    'custom:hermes-mini-card',
            title:                   'Activity',
            global_timespan_seconds: 30
        };
    }

    setConfig(config: HermesCardConfig | null | undefined): void
    {
        if (!config || typeof config !== 'object')
        {
            throw new Error('Invalid configuration');
        }

        const resolved = resolveConfig(config);

        const engineCfg: HermesEngineConfig =
        {
            timespan_seconds:   Math.max(resolved.timespanSeconds, resolved.globalTimespanSeconds),
            max_pings:          resolved.maxPings,
            ignore_unavailable: resolved.ignoreUnavailable,
            entities:           resolved.entities,
            include_domains:    resolved.includeDomains,
            exclude_entities:   resolved.excludeEntities,
            exclude_domains:    resolved.excludeDomains
        };

        if (!this.engine)
        {
            this.engine = new HermesEngine(engineCfg);
            this.engineUnsubscribe = this.engine.onUpdate(() =>
            {
                this._entityCount = this.engine?.getLaneCount() ?? 0;
                this.requestRedraw();
            });
        }
        else
        {
            this.engine.setConfig(engineCfg);
        }

        this._config = resolved;
        this.dirty = true;
    }

    //Masonry sizing. 1 unit ≈ 50 px → 6 ≈ 300 px for the full
    //card, 2 ≈ 100 px for the mini variant.
    getCardSize(): number
    {
        return this.isMini ? 2 : 6;
    }

    //Sections grid sizing. 1 row ≈ 56 px. The full card defaults
    //to 6 rows / full width; the mini variant collapses to a
    //2-row strip with the same width budget.
    getGridOptions(): {
        rows:        number;
        columns:     number;
        min_rows:    number;
        max_rows:    number;
        min_columns: number;
        max_columns: number;
    }
    {
        if (this.isMini)
        {
            return {
                rows:        2,
                columns:     12,
                min_rows:    1,
                max_rows:    4,
                min_columns: 4,
                max_columns: 12
            };
        }
        return {
            rows:        6,
            columns:     12,
            min_rows:    3,
            max_rows:    24,
            min_columns: 6,
            max_columns: 12
        };
    }

    //----- lifecycle -----

    override connectedCallback(): void
    {
        super.connectedCallback();

        //Reflect the variant onto a host attribute so the
        //scoped CSS can target the mini card directly (smaller
        //min-height on ha-card, denser header padding, ...)
        //without forcing every rule to thread a class through
        //two levels of shadow root.
        if (this.isMini)
        {
            this.setAttribute('data-mini', '');
        }

        if (typeof navigator !== 'undefined')
        {
            this._i18n = pickTranslations(navigator.language);
        }

        this.startRaf();
    }

    override disconnectedCallback(): void
    {
        super.disconnectedCallback();

        if (this.engineUnsubscribe)
        {
            this.engineUnsubscribe();
            this.engineUnsubscribe = null;
        }
        this.engine?.unbind();

        this.stopRaf();
        this.teardownDom();
    }

    override updated(changed: PropertyValues): void
    {
        super.updated(changed);

        if (!this.rootEl)
        {
            this.rootEl = this.renderRoot.querySelector('.root') as HTMLDivElement | null;
        }
        if (!this.stageEl)
        {
            this.stageEl = this.renderRoot.querySelector('.stage') as HTMLDivElement | null;
        }
        if (!this.scrollEl)
        {
            this.scrollEl = this.renderRoot.querySelector('.stage-scroll-layer') as HTMLDivElement | null;
            if (this.scrollEl)
            {
                //All pointer events for the stage land on the
                //scroll overlay - the canvas underneath has
                //`pointer-events: none` so the wheel / touch /
                //mouse always reach the scroller cleanly.
                this.scrollEl.addEventListener('scroll', this.handleScroll, { passive: true });
                this.scrollEl.addEventListener('mousemove', this.handleStageMouseMove);
                this.scrollEl.addEventListener('mouseleave', this.handleStageMouseLeave);
                this.scrollEl.addEventListener('touchstart', this.handleStageTouch, { passive: true });
                this.scrollEl.addEventListener('touchmove', this.handleStageTouch, { passive: true });
                this.scrollEl.addEventListener('touchend', this.handleStageMouseLeave);
            }
        }
        if (!this.spacerEl)
        {
            this.spacerEl = this.renderRoot.querySelector('.stage-spacer') as HTMLDivElement | null;
        }
        if (!this.stageCanvas)
        {
            this.stageCanvas = this.renderRoot.querySelector('.stage-canvas-layer canvas') as HTMLCanvasElement | null;
            if (this.stageCanvas)
            {
                this.stageCtx = this.stageCanvas.getContext('2d', { alpha: true });
            }
        }
        if (!this.globalEl)
        {
            this.globalEl = this.renderRoot.querySelector('.global') as HTMLDivElement | null;
        }
        if (!this.globalCanvas)
        {
            this.globalCanvas = this.renderRoot.querySelector('.global canvas') as HTMLCanvasElement | null;
            if (this.globalCanvas)
            {
                this.globalCtx = this.globalCanvas.getContext('2d', { alpha: true });
                this.globalCanvas.addEventListener('mousemove', this.handleGlobalMouseMove);
                this.globalCanvas.addEventListener('mouseleave', this.handleGlobalMouseLeave);
                this.globalCanvas.addEventListener('touchstart', this.handleGlobalTouch, { passive: true });
                this.globalCanvas.addEventListener('touchmove', this.handleGlobalTouch, { passive: true });
                this.globalCanvas.addEventListener('touchend', this.handleGlobalMouseLeave);
            }
        }
        if (!this.resizeObserver && this.rootEl)
        {
            this.resizeObserver = new ResizeObserver(() => this.handleResize());
            this.resizeObserver.observe(this.rootEl);
            this.handleResize();
        }

        if (changed.has('hass') && this.hass && this.engine)
        {
            this.engine.bind(this.hass);
        }
    }

    //----- render -----

    //Mini variant flag, dispatched on tag name so a single bundle
    //ships both <hermes-card> and <hermes-mini-card>. Subclassed
    //below at end of file with no extra logic - the override here
    //is enough.
    protected get isMini(): boolean
    {
        return this.tagName.toLowerCase() === 'hermes-mini-card';
    }

    override render(): TemplateResult
    {
        const cfg = this._config;
        const tt = this._tooltip;
        const themeClass = cfg.theme === 'light' ? 'theme-light' : 'theme-dark';
        const mini = this.isMini;

        //In mini mode the card collapses to a single horizontal
        //strip: the global timeline fills 100 % of the available
        //height and the per-entity stage is dropped entirely. The
        //user always reaches it from the HA card picker as a
        //separate <hermes-mini-card> entry.
        if (mini)
        {
            return html`
                <ha-card>
                    <div class="root ${themeClass} mini">
                        <div class="header">
                            <div class="title">${cfg.title}</div>
                            <div class="subtitle">
                                ${this._entityCount} ${this._entityCount === 1 ? this._i18n.entity : this._i18n.entities}
                            </div>
                            <div class="spacer"></div>
                            ${cfg.showLegend ? this.renderLegend() : nothing}
                        </div>
                        <div class="global mini">
                            <canvas></canvas>
                            ${this.renderPlayPauseButton()}
                        </div>
                        ${this._entityCount === 0 ? this.renderEmpty() : nothing}
                        ${tt.visible ? this.renderTooltip(tt) : nothing}
                    </div>
                </ha-card>
            `;
        }

        return html`
            <ha-card>
                <div class="root ${themeClass}">
                    <div class="header">
                        <div class="title">${cfg.title}</div>
                        <div class="subtitle">
                            ${this._entityCount} ${this._entityCount === 1 ? this._i18n.entity : this._i18n.entities}
                        </div>
                        <div class="spacer"></div>
                        ${cfg.showLegend ? this.renderLegend() : nothing}
                    </div>

                    ${cfg.showGlobal ? html`
                        <div class="global" style=${`height:${cfg.globalHeight}px;`}>
                            <canvas></canvas>
                            ${this.renderPlayPauseButton()}
                        </div>
                        <div class="divider"></div>
                    ` : nothing}

                    <div class="stage">
                        <div class="stage-canvas-layer">
                            <canvas></canvas>
                        </div>
                        <div class="stage-scroll-layer">
                            <div class="stage-spacer"></div>
                        </div>
                    </div>

                    ${this._entityCount === 0 ? this.renderEmpty() : nothing}
                    ${tt.visible ? this.renderTooltip(tt) : nothing}
                </div>
            </ha-card>
        `;
    }

    //Inline SVGs for the play / pause icons. Stroked with
    //currentColor so they pick up the theme-aware text colour
    //and stay legible against either background.
    private renderPlayPauseButton(): TemplateResult
    {
        const paused = this._paused;
        const aria = paused ? this._i18n.actionPlay : this._i18n.actionPause;
        const icon = paused
            //Right-pointing triangle.
            ? html`<svg viewBox="0 0 24 24" aria-hidden="true">
                       <path d="M8 5 L19 12 L8 19 Z" fill="currentColor" />
                   </svg>`
            //Two bars.
            : html`<svg viewBox="0 0 24 24" aria-hidden="true">
                       <rect x="7" y="5" width="3.6" height="14" rx="1" fill="currentColor" />
                       <rect x="13.4" y="5" width="3.6" height="14" rx="1" fill="currentColor" />
                   </svg>`;

        return html`
            <button
                type="button"
                class="play-pause-btn ${paused ? 'is-paused' : 'is-playing'}"
                title=${aria}
                aria-label=${aria}
                @click=${this.togglePause}
            >${icon}</button>
        `;
    }

    private renderLegend(): TemplateResult
    {
        //Only show legend chips for channels that have actually
        //emitted a ping in this session, so the chrome stays
        //quiet on lightly used dashboards.
        const present = new Set<Channel>();
        if (this.engine)
        {
            for (const lane of this.engine.getSnapshot().lanes)
            {
                present.add(lane.channel);
            }
        }

        if (present.size === 0)
        {
            return html``;
        }

        const items: TemplateResult[] = [];
        const orderedChannels = Object.keys(CHANNEL_COLOR) as Channel[];
        for (const ch of orderedChannels)
        {
            if (!present.has(ch))
            {
                continue;
            }
            const color = CHANNEL_COLOR[ch];
            items.push(html`
                <span class="chip">
                    <span class="swatch" style=${`background:${color};color:${color};`}></span>
                    ${CHANNEL_LABEL[ch]}
                </span>
            `);
        }
        return html`<div class="legend">${items}</div>`;
    }

    private renderEmpty(): TemplateResult
    {
        return html`
            <div class="empty">
                <div class="pulse"></div>
                <div>${this._i18n.emptyTitle}</div>
                <div style="opacity:.7;font-size:11px;">${this._i18n.emptyHint}</div>
            </div>
        `;
    }

    private renderTooltip(tt: TooltipState): TemplateResult
    {
        const placeClass = tt.place === 'below' ? 'below' : 'above';
        const inlineStyle =
            `left:${tt.x}px;top:${tt.y}px;` +
            `border-color:${withAlpha(tt.color, 0.4)};` +
            `--hermes-arrow-offset:${tt.arrowOffset}px;`;

        //Mini card: a single thin strip has neither the vertical
        //room nor the visual budget for the full info block.
        //We collapse to just the entity name and the current
        //value, and switch the bubble to position:fixed so it
        //can escape ha-card's overflow:hidden when the strip is
        //pressed against the dashboard edge.
        if (this.isMini)
        {
            return html`
                <div
                    class="tooltip visible mini ${placeClass}"
                    style=${inlineStyle}
                >
                    <div class="tt-name" style=${`color:${tt.color};`}>${tt.name}</div>
                    <div class="tt-row">
                        <span class="label">${this._i18n.tooltipValue}</span>
                        <span class="value">${tt.value}</span>
                    </div>
                    <div class="tt-arrow"></div>
                </div>
            `;
        }

        return html`
            <div
                class="tooltip visible ${placeClass}"
                style=${inlineStyle}
            >
                <div class="tt-name" style=${`color:${tt.color};`}>${tt.name}</div>
                <div class="tt-id">${tt.entityId}</div>
                <div class="tt-row">
                    <span class="label">${this._i18n.tooltipValue}</span>
                    <span class="value">${tt.value}</span>
                </div>
                ${tt.previous ? html`
                    <div class="tt-row">
                        <span class="label">${this._i18n.tooltipPrevious}</span>
                        <span class="value">${tt.previous}</span>
                    </div>` : nothing}
                <div class="tt-row">
                    <span class="label">${this._i18n.tooltipAgo}</span>
                    <span class="value">${tt.ago}</span>
                </div>
                ${tt.showCount ? html`
                    <div class="tt-row">
                        <span class="label">${this._i18n.tooltipCount}</span>
                        <span class="value">${tt.count}</span>
                    </div>` : nothing}
                <div class="tt-arrow"></div>
            </div>
        `;
    }

    //----- event handlers -----

    private handleResize = (): void =>
    {
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        this.dpr = dpr;

        //Stage canvas: present only in the full card. The
        //mini-card path has no stage and we silently skip.
        if (this.stageEl && this.stageCanvas)
        {
            const stageRect = this.stageEl.getBoundingClientRect();
            const sw = Math.max(0, Math.floor(stageRect.width));
            const sh = Math.max(0, Math.floor(stageRect.height));

            if (sw !== this.stageW || sh !== this.stageH)
            {
                this.stageW = sw;
                this.stageH = sh;
                this.stageCanvas.width  = Math.max(1, Math.floor(sw * dpr));
                this.stageCanvas.height = Math.max(1, Math.floor(sh * dpr));
                this.stageCanvas.style.width  = `${sw}px`;
                this.stageCanvas.style.height = `${sh}px`;
            }
        }

        //Global canvas: present in both layouts.
        if (this.globalCanvas && this.globalEl)
        {
            const grect = this.globalEl.getBoundingClientRect();
            const gw = Math.max(0, Math.floor(grect.width));
            const gh = Math.max(0, Math.floor(grect.height));
            if (gw !== this.globalW || gh !== this.globalH)
            {
                this.globalW = gw;
                this.globalH = gh;
                this.globalCanvas.width  = Math.max(1, Math.floor(gw * dpr));
                this.globalCanvas.height = Math.max(1, Math.floor(gh * dpr));
                this.globalCanvas.style.width  = `${gw}px`;
                this.globalCanvas.style.height = `${gh}px`;
            }
        }

        this.dirty = true;
    };

    private handleScroll = (): void =>
    {
        if (!this.scrollEl) return;
        this.stageScrollY = this.scrollEl.scrollTop;
        this.dirty = true;
    };

    private handleStageMouseMove = (ev: MouseEvent): void =>
    {
        //Mouse coords are taken relative to the canvas (which
        //fills the same box as the scroll layer thanks to inset:
        //0). Computing against the canvas keeps the hit-test
        //consistent even if the scroll layer happens to be a
        //pixel off from the canvas during a resize.
        const target = this.stageCanvas ?? this.scrollEl;
        if (!target) return;
        const r = target.getBoundingClientRect();
        this.stageMouse = { x: ev.clientX - r.left, y: ev.clientY - r.top };
        this.dirty = true;
    };

    private handleStageMouseLeave = (): void =>
    {
        this.stageMouse = { x: -1, y: -1 };
        this._stickyStagePingId = 0;
        this.maybeHideTooltip('stage');
        this.dirty = true;
    };

    private handleStageTouch = (ev: TouchEvent): void =>
    {
        if (!ev.touches.length) return;
        const target = this.stageCanvas ?? this.scrollEl;
        if (!target) return;
        const t = ev.touches[0];
        const r = target.getBoundingClientRect();
        this.stageMouse = { x: t.clientX - r.left, y: t.clientY - r.top };
        this.dirty = true;
    };

    private handleGlobalMouseMove = (ev: MouseEvent): void =>
    {
        if (!this.globalCanvas) return;
        const r = this.globalCanvas.getBoundingClientRect();
        this.globalMouse = { x: ev.clientX - r.left, y: ev.clientY - r.top };
        this.dirty = true;
    };

    private handleGlobalMouseLeave = (): void =>
    {
        this.globalMouse = { x: -1, y: -1 };
        this._stickyGlobalPingId = 0;
        this.maybeHideTooltip('global');
        this.dirty = true;
    };

    private handleGlobalTouch = (ev: TouchEvent): void =>
    {
        if (!ev.touches.length || !this.globalCanvas) return;
        const t = ev.touches[0];
        const r = this.globalCanvas.getBoundingClientRect();
        this.globalMouse = { x: t.clientX - r.left, y: t.clientY - r.top };
        this.dirty = true;
    };

    //----- animation loop -----

    private startRaf(): void
    {
        if (this.rafHandle !== 0) return;
        this._lastRafTime = performance.now();
        const loop = (t: number) =>
        {
            this.rafHandle = requestAnimationFrame(loop);
            this.advanceRenderTime(t);
            this.paint();
        };
        this.rafHandle = requestAnimationFrame(loop);
    }

    //Per-frame update of the renderer's time cursor. Three
    //regimes:
    //  - paused: cursor frozen. Engine keeps recording, so on
    //    resume we have everything to replay.
    //  - catching up: cursor advances at CATCH_UP_SPEED until
    //    within LIVE_EPSILON_MS of wall-clock time.
    //  - live: cursor snaps to Date.now() each frame, the most
    //    accurate reading and the cheapest path.
    private advanceRenderTime(rafTime: number): void
    {
        const dt = Math.max(0, rafTime - this._lastRafTime);
        this._lastRafTime = rafTime;

        if (this._paused)
        {
            return;
        }

        const realNow = Date.now();
        const gap = realNow - this._renderNow;
        if (gap <= LIVE_EPSILON_MS)
        {
            this._renderNow = realNow;
            return;
        }

        //Catch-up: advance at CATCH_UP_SPEED real-time, clamped
        //to wall-clock so we never overshoot. dt is the frame's
        //real-world delta, multiplied by the playback speed to
        //consume the gap quickly.
        const next = this._renderNow + dt * CATCH_UP_SPEED;
        this._renderNow = next >= realNow ? realNow : next;
        this.dirty = true;
    }

    private stopRaf(): void
    {
        if (this.rafHandle !== 0)
        {
            cancelAnimationFrame(this.rafHandle);
            this.rafHandle = 0;
        }
    }

    private requestRedraw(): void
    {
        this.dirty = true;
    }

    private togglePause = (ev?: Event): void =>
    {
        ev?.stopPropagation();
        this._paused = !this._paused;
        //Snap the cursor to wall-clock when entering pause so
        //the freeze instant is unambiguous; the engine keeps
        //recording, and on resume the catch-up logic in
        //advanceRenderTime takes over.
        if (this._paused)
        {
            this._renderNow = Date.now();
        }
        this.dirty = true;
    };

    private teardownDom(): void
    {
        if (this.resizeObserver)
        {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        if (this.scrollEl)
        {
            this.scrollEl.removeEventListener('scroll', this.handleScroll);
            this.scrollEl.removeEventListener('mousemove', this.handleStageMouseMove);
            this.scrollEl.removeEventListener('mouseleave', this.handleStageMouseLeave);
            this.scrollEl.removeEventListener('touchstart', this.handleStageTouch);
            this.scrollEl.removeEventListener('touchmove', this.handleStageTouch);
            this.scrollEl.removeEventListener('touchend', this.handleStageMouseLeave);
        }
        if (this.globalCanvas)
        {
            this.globalCanvas.removeEventListener('mousemove', this.handleGlobalMouseMove);
            this.globalCanvas.removeEventListener('mouseleave', this.handleGlobalMouseLeave);
            this.globalCanvas.removeEventListener('touchstart', this.handleGlobalTouch);
            this.globalCanvas.removeEventListener('touchmove', this.handleGlobalTouch);
            this.globalCanvas.removeEventListener('touchend', this.handleGlobalMouseLeave);
        }
    }

    //----- paint -----

    //Palette resolved once per frame from the theme CSS variables
    //on .root. The renderer never reads colour-mode constants
    //directly so flipping `card_theme` reskins the canvases on
    //the next paint with no extra plumbing.
    private readPalette(): CanvasPalette
    {
        if (!this.rootEl)
        {
            return DEFAULT_PALETTE;
        }
        const cs = getComputedStyle(this.rootEl);
        const get = (name: string, fallback: string) =>
        {
            const v = cs.getPropertyValue(name).trim();
            return v.length > 0 ? v : fallback;
        };
        return {
            text:    get('--hermes-canvas-text', DEFAULT_PALETTE.text),
            mute:    get('--hermes-canvas-mute', DEFAULT_PALETTE.mute),
            midline: get('--hermes-midline',     DEFAULT_PALETTE.midline)
        };
    }

    private paint(): void
    {
        if (!this.engine) return;

        //Drive the engine's eviction off our own cursor so paused
        //pings stay in the buffer waiting to be replayed when the
        //user un-pauses.
        const snapshot = this.engine.getSnapshot(this._renderNow);
        const hasMotion = snapshot.pings.length > 0;
        if (!hasMotion && !this.dirty) return;
        this.dirty = false;

        const palette = this.readPalette();

        //Sync the inner spacer's height so the scrollbar reflects
        //the true content extent. The pinned canvas already takes
        //one viewport's worth of vertical space (it's sticky and
        //height:100%), so the spacer only needs to provide the
        //*overflow* beyond the viewport.
        const totalContentHeight = this.computeTotalContentHeight(snapshot.lanes.length);
        if (this.spacerEl)
        {
            const spacerH = Math.max(0, totalContentHeight - this.stageH);
            this.spacerEl.style.height = `${Math.max(1, spacerH)}px`;
        }

        let tooltipUpdated = false;
        const stageTooltip = this.paintStage(snapshot, totalContentHeight, palette);
        const globalTooltip = this._config.showGlobal ? this.paintGlobal(snapshot, palette) : null;

        //Resolve tooltip precedence: whichever canvas the cursor
        //is currently over wins. If both are over (shouldn't
        //normally happen), the global strip wins since it's on
        //top of the layout.
        const winner = (this.globalMouse.x >= 0 ? globalTooltip : null)
                    ?? (this.stageMouse.x >= 0 ? stageTooltip : null)
                    ?? null;

        if (winner)
        {
            this._tooltip = winner;
            tooltipUpdated = true;
        }
        else if (this._tooltip.visible)
        {
            this._tooltip = EMPTY_TOOLTIP;
            tooltipUpdated = true;
        }

        //Tooltip movement during static scenes still needs a
        //repaint so the loop doesn't stall against `dirty=false`.
        if (tooltipUpdated)
        {
            this.dirty = true;
        }
    }

    private computeTotalContentHeight(laneCount: number): number
    {
        if (laneCount === 0) return 0;
        return STAGE_PAD_TOP + laneCount * LANE_PITCH + STAGE_PAD_BOTTOM;
    }

    private paintStage(snapshot: ReturnType<HermesEngine['getSnapshot']>, totalContentHeight: number, palette: CanvasPalette): TooltipState | null
    {
        const ctx = this.stageCtx;
        if (!ctx || this.stageW === 0 || this.stageH === 0) return null;

        const cfg = this._config;

        ctx.save();
        ctx.scale(this.dpr, this.dpr);
        ctx.clearRect(0, 0, this.stageW, this.stageH);

        const labelW    = cfg.labelWidth;
        const valueW    = cfg.showLastValue ? cfg.valueWidth : 0;
        const gutterW   = labelW > 0 ? labelW + valueW : 0;
        const innerLeft  = gutterW;
        const innerRight = this.stageW - STAGE_PAD_RIGHT;
        const innerWidth = Math.max(0, innerRight - innerLeft);

        //The virtual content extends from y = 0 to y =
        //totalContentHeight. The scroller has scrolled the user
        //by `stageScrollY`, so we draw with that offset.
        const scrollY = clamp(
            this.stageScrollY,
            0,
            Math.max(0, totalContentHeight - this.stageH)
        );

        //Cull lanes that are not on screen so the hit-test and
        //the paint stay cheap regardless of how many entities are
        //tracked.
        const firstLane = Math.max(
            0,
            Math.floor((scrollY - STAGE_PAD_TOP) / LANE_PITCH)
        );
        const lastLane = Math.min(
            snapshot.lanes.length - 1,
            Math.ceil((scrollY + this.stageH - STAGE_PAD_TOP) / LANE_PITCH)
        );

        //Pre-compute Y for visible lanes so the ping loop doesn't
        //have to redo it for every sphere.
        const laneY = new Map<string, { y: number; color: HexColor; lane: Lane }>();
        for (let i = firstLane; i <= lastLane; i++)
        {
            const lane = snapshot.lanes[i];
            if (!lane) continue;
            const y = STAGE_PAD_TOP + i * LANE_PITCH + LANE_PITCH / 2 - scrollY;
            laneY.set(lane.entityId, { y, color: lane.color, lane });
        }

        //Draw the dashed lane tracks + two-column labels.
        this.drawLaneTracks(ctx, laneY, innerLeft, innerRight, labelW, valueW, palette);

        //Now the pings, oldest first so newer ones glow over
        //older ones.
        const timespanMs = Math.max(1000, cfg.timespanSeconds * 1000);
        const now = snapshot.now;

        let bestHit: { ping: Ping; dist: number; x: number; y: number; r: number } | null = null;

        for (let i = 0; i < snapshot.pings.length; i++)
        {
            const p = snapshot.pings[i];
            const slot = laneY.get(p.entityId);
            if (!slot) continue;  //lane off-screen

            const ageMs = now - p.ts;
            const frac = ageMs / timespanMs;
            if (frac < 0 || frac > 1) continue;

            const x = innerRight - frac * innerWidth;
            const y = slot.y;

            //Slightly larger than the previous "body + halo"
            //design: with the halo gone, the disc itself has to
            //carry the visual weight.
            const baseR = LANE_INNER * 0.42;
            const r = Math.max(3, baseR * (0.55 + p.magnitude * 0.65));

            const tailFrac = Math.max(0, (frac - (1 - FADE_TAIL_FRAC)) / FADE_TAIL_FRAC);
            const alpha = 1 - tailFrac;

            this.drawPing(ctx, x, y, r, p.color, alpha);

            if (this.stageMouse.x >= 0)
            {
                const dx = x - this.stageMouse.x;
                const dy = y - this.stageMouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const reach = r + HIT_RADIUS_PAD;
                if (dist <= reach && (!bestHit || dist < bestHit.dist))
                {
                    bestHit = { ping: p, dist, x, y, r };
                }
            }
        }

        ctx.restore();

        if (bestHit && this.stageCanvas)
        {
            //Fresh hit: arm the sticky lock to the new ping so
            //the tooltip keeps following it as it slides left.
            this._stickyStagePingId = bestHit.ping.id;
            return this.buildTooltipFromPing(bestHit.ping, bestHit.x, bestHit.y, this.stageCanvas, false);
        }

        //No fresh hit. Check the sticky lock: if the cursor is
        //still over the same lane as the ping we last hovered,
        //and that ping is still on screen, keep the tooltip
        //pinned to it at its new (leftward-shifted) position.
        //This is what stops the tooltip from flickering off
        //every time a ping slips out from under a stationary
        //cursor.
        if (this._stickyStagePingId !== 0 && this.stageMouse.x >= 0 && this.stageCanvas)
        {
            const sticky = this.findStickyPing(snapshot.pings, this._stickyStagePingId,
                                               laneY, now, timespanMs, innerRight, innerWidth);
            if (sticky)
            {
                return this.buildTooltipFromPing(sticky.ping, sticky.x, sticky.y, this.stageCanvas, false);
            }
            //The sticky ping is gone or the cursor has wandered
            //out of its lane; release the lock.
            this._stickyStagePingId = 0;
        }

        //If the cursor is hovering the left gutter (the name or
        //value column), surface a lane-info tooltip with the
        //full friendly name, entity_id and current value - this
        //is what makes long, clipped entity names readable.
        if (gutterW > 0 && this.stageMouse.x >= 0 && this.stageMouse.x < gutterW && this.stageCanvas)
        {
            for (const slot of laneY.values())
            {
                const half = LANE_PITCH / 2;
                if (Math.abs(this.stageMouse.y - slot.y) <= half)
                {
                    return this.buildTooltipFromLane(slot.lane, this.stageMouse.x, slot.y, this.stageCanvas);
                }
            }
        }

        return null;
    }

    //Re-locate a sticky ping by id in the current snapshot. The
    //hit is valid only if the ping is still within the visible
    //time window AND the cursor is still vertically in its lane
    //(within ±half a lane pitch of the lane centre). Returns
    //the ping plus its freshly-computed (x, y) so the renderer
    //can place the tooltip without re-doing the loop's math.
    private findStickyPing(
        pings:       readonly Ping[],
        stickyId:    number,
        laneY:       Map<string, { y: number; color: HexColor; lane: Lane }>,
        now:         number,
        timespanMs:  number,
        innerRight:  number,
        innerWidth:  number
    ): { ping: Ping; x: number; y: number } | null
    {
        for (let i = 0; i < pings.length; i++)
        {
            const p = pings[i];
            if (p.id !== stickyId) continue;
            const slot = laneY.get(p.entityId);
            if (!slot) return null;
            const half = LANE_PITCH / 2;
            if (Math.abs(this.stageMouse.y - slot.y) > half) return null;
            const frac = (now - p.ts) / timespanMs;
            if (frac < 0 || frac > 1) return null;
            return { ping: p, x: innerRight - frac * innerWidth, y: slot.y };
        }
        return null;
    }

    private paintGlobal(snapshot: ReturnType<HermesEngine['getSnapshot']>, palette: CanvasPalette): TooltipState | null
    {
        const ctx = this.globalCtx;
        if (!ctx || this.globalW === 0 || this.globalH === 0) return null;

        const cfg = this._config;

        ctx.save();
        ctx.scale(this.dpr, this.dpr);
        ctx.clearRect(0, 0, this.globalW, this.globalH);

        //Subtle midline so the strip reads as a track, not a
        //random blob field. Colour comes from the theme palette
        //so it stays legible against either background.
        ctx.strokeStyle = palette.midline;
        ctx.lineWidth = 1;
        ctx.setLineDash([1.5, 4]);
        ctx.beginPath();
        ctx.moveTo(GLOBAL_PAD_X, this.globalH / 2);
        ctx.lineTo(this.globalW - GLOBAL_PAD_X, this.globalH / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        const innerLeft  = GLOBAL_PAD_X;
        const innerRight = this.globalW - GLOBAL_PAD_X;
        const innerWidth = Math.max(0, innerRight - innerLeft);

        const timespanMs = Math.max(500, cfg.globalTimespanSeconds * 1000);
        const now = snapshot.now;

        //Cap on radius reserves a margin below the strip edges.
        //Bumped a little versus the original halo-based design
        //since the disc now has to read on its own.
        const maxR = Math.min(18, (this.globalH - GLOBAL_INNER_PAD * 2) * 0.48);
        const baseR = 2.4;
        const jitterRange = (this.globalH / 2) - GLOBAL_INNER_PAD - maxR;
        const centreY = this.globalH / 2;

        let bestHit: { ping: Ping; dist: number; x: number; y: number; r: number } | null = null;

        for (let i = 0; i < snapshot.pings.length; i++)
        {
            const p = snapshot.pings[i];
            const ageMs = now - p.ts;
            const frac = ageMs / timespanMs;
            if (frac < 0 || frac > 1) continue;

            const x = innerRight - frac * innerWidth;

            //Stable Y per entity so the same entity always pings
            //on the same vertical track. The hash is a hot loop,
            //so we cache it on `entityYCache` between frames.
            const h = entityHash(p.entityId);
            const y = centreY + (h - 0.5) * 2 * Math.max(0, jitterRange);

            //Radius scales with the ping ordinal: every new ping
            //for an entity gets a slightly larger disc than the
            //previous, up to maxR. Log scale so a sensor pinging
            //a thousand times doesn't dominate.
            const r = Math.min(maxR, baseR + Math.log2(p.pingIndex + 1) * 1.85);

            const tailFrac = Math.max(0, (frac - (1 - FADE_TAIL_FRAC)) / FADE_TAIL_FRAC);
            const alpha = 1 - tailFrac;

            this.drawPing(ctx, x, y, r, p.color, alpha);

            if (this.globalMouse.x >= 0)
            {
                const dx = x - this.globalMouse.x;
                const dy = y - this.globalMouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const reach = r + HIT_RADIUS_PAD;
                if (dist <= reach && (!bestHit || dist < bestHit.dist))
                {
                    bestHit = { ping: p, dist, x, y, r };
                }
            }
        }

        ctx.restore();

        if (bestHit && this.globalCanvas)
        {
            this._stickyGlobalPingId = bestHit.ping.id;
            return this.buildTooltipFromPing(bestHit.ping, bestHit.x, bestHit.y, this.globalCanvas, true);
        }

        //Sticky fallback: keep the tooltip pinned to the last
        //hovered ping as it drifts left, until the cursor leaves
        //the canvas or the ping ages out of the visible window.
        //The global strip is a single row, so there's no lane
        //band check - any cursor position on the canvas keeps
        //the lock alive.
        if (this._stickyGlobalPingId !== 0 && this.globalMouse.x >= 0 && this.globalCanvas)
        {
            for (let i = 0; i < snapshot.pings.length; i++)
            {
                const p = snapshot.pings[i];
                if (p.id !== this._stickyGlobalPingId) continue;
                const frac = (now - p.ts) / timespanMs;
                if (frac < 0 || frac > 1) break;
                const x = innerRight - frac * innerWidth;
                const h = entityHash(p.entityId);
                const y = centreY + (h - 0.5) * 2 * Math.max(0, jitterRange);
                return this.buildTooltipFromPing(p, x, y, this.globalCanvas, true);
            }
            this._stickyGlobalPingId = 0;
        }

        return null;
    }

    private drawLaneTracks(
        ctx:         CanvasRenderingContext2D,
        laneY:       Map<string, { y: number; color: HexColor; lane: Lane }>,
        innerLeft:   number,
        innerRight:  number,
        labelW:      number,
        valueW:      number,
        palette:     CanvasPalette
    ): void
    {
        const labelFont = '500 11px ' + getFontFamily();
        const valueFont = '400 10.5px ' + getMonoFamily();
        const dimColor  = palette.text;
        const muteColor = palette.mute;

        const nameMaxWidth = labelW > 0
            ? Math.max(0, labelW - LABEL_TEXT_START - LABEL_COL_GAP / 2)
            : 0;
        const valueAnchorX = labelW + valueW - VALUE_RIGHT_PAD;
        const valueMaxWidth = Math.max(0, valueW - LABEL_COL_GAP / 2 - VALUE_RIGHT_PAD);

        ctx.lineWidth = 1;

        for (const slot of laneY.values())
        {
            const lane = slot.lane;

            //Soft dashed track on the centreline tinted with the
            //channel colour.
            ctx.setLineDash([1.5, 4]);
            ctx.strokeStyle = withAlpha(lane.color, 0.18);
            ctx.beginPath();
            ctx.moveTo(innerLeft, slot.y);
            ctx.lineTo(innerRight, slot.y);
            ctx.stroke();
            ctx.setLineDash([]);

            if (labelW > 0)
            {
                //Channel-coloured dot.
                ctx.fillStyle = lane.color;
                ctx.beginPath();
                ctx.arc(LABEL_DOT_X, slot.y, LABEL_DOT_R, 0, Math.PI * 2);
                ctx.fill();

                //Name column.
                ctx.fillStyle = dimColor;
                ctx.font = labelFont;
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'left';
                ctx.fillText(
                    clipText(ctx, lane.friendlyName, nameMaxWidth),
                    LABEL_TEXT_START,
                    slot.y
                );

                //Value column (right-aligned, separate width
                //budget so it cannot collide with the name).
                if (valueW > 0 && lane.lastState !== null)
                {
                    ctx.fillStyle = muteColor;
                    ctx.font = valueFont;
                    ctx.textAlign = 'right';
                    const valueStr = formatLaneValue(lane.lastState, lane.unit);
                    ctx.fillText(
                        clipText(ctx, valueStr, valueMaxWidth),
                        valueAnchorX,
                        slot.y
                    );
                }
            }
        }
    }

    private drawPing(
        ctx:   CanvasRenderingContext2D,
        x:     number,
        y:     number,
        r:     number,
        color: HexColor,
        alpha: number
    ): void
    {
        //One flat disc, no specular highlight, no additive halo.
        //A single radial gradient from solid-ish at the centre to
        //full transparency at the rim gives the soft edge the
        //design calls for - the disc reads as a coloured dot
        //fading into the background, not a 3D sphere.
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0,    withAlpha(color, 0.80 * alpha));
        gradient.addColorStop(0.55, withAlpha(color, 0.55 * alpha));
        gradient.addColorStop(1,    withAlpha(color, 0));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    //Translate a (canvas-local) sphere position into a tooltip
    //placed in .root coordinates so the tooltip element (which
    //lives directly under .root) lines up correctly regardless of
    //which canvas the ping came from. We clamp the bubble's
    //horizontal centre to keep it inside the card, flip it below
    //the sphere when there isn't enough room above, and forward
    //the residual offset so the arrow still points at the ping.
    private buildTooltipFromPing(
        p:           Ping,
        canvasX:     number,
        canvasY:     number,
        sourceCanvas: HTMLCanvasElement,
        global:      boolean
    ): TooltipState
    {
        const placement = this.computeTooltipPlacement(canvasX, canvasY, sourceCanvas);
        const ageMs = Date.now() - p.ts;

        return {
            visible:     true,
            x:           placement.x,
            y:           placement.y,
            place:       placement.place,
            arrowOffset: placement.arrowOffset,
            pingId:      p.id,
            showCount:   global,
            name:        p.friendlyName,
            entityId:    p.entityId,
            value:       formatLaneValue(p.newState, p.unit),
            previous:    p.oldState !== null ? formatLaneValue(p.oldState, p.unit) : '',
            ago:         formatAgo(ageMs, this._i18n),
            count:       p.pingIndex,
            color:       p.color
        };
    }

    //Resolve a tooltip's screen position (clamp + above/below
    //flip + arrow offset) once and reuse it for both the ping
    //and the lane variants.
    //
    //In mini-card mode the bounds are the viewport (because the
    //tooltip uses position:fixed to escape ha-card's overflow
    //clip in a strip that's barely tall enough to host it). In
    //the full card we stay in .root coords as before.
    private computeTooltipPlacement(
        canvasX:     number,
        canvasY:     number,
        sourceCanvas: HTMLCanvasElement
    ): { x: number; y: number; place: 'above' | 'below'; arrowOffset: number }
    {
        const mini = this.isMini;
        const canvasRect = sourceCanvas.getBoundingClientRect();
        const rootRect = this.rootEl?.getBoundingClientRect();

        const halfW = mini ? TOOLTIP_HALF_W_MINI : TOOLTIP_HALF_W;
        const tipH  = mini ? TOOLTIP_H_MINI      : TOOLTIP_H;

        let rawX: number;
        let rawY: number;
        let boundsW: number;
        let boundsH: number;
        let topPad: number;
        let leftPad: number;

        if (mini)
        {
            rawX    = canvasRect.left + canvasX;
            rawY    = canvasRect.top  + canvasY;
            boundsW = window.innerWidth;
            boundsH = window.innerHeight;
            topPad  = 0;
            leftPad = 0;
        }
        else
        {
            rawX    = (canvasRect.left - (rootRect?.left ?? 0)) + canvasX;
            rawY    = (canvasRect.top  - (rootRect?.top  ?? 0)) + canvasY;
            boundsW = rootRect?.width  ?? this.stageW;
            boundsH = rootRect?.height ?? this.stageH;
            topPad  = 0;
            leftPad = 0;
        }

        const minX = leftPad + TOOLTIP_MARGIN + halfW;
        const maxX = Math.max(minX, boundsW - TOOLTIP_MARGIN - halfW);
        const clampedX = rawX < minX ? minX : rawX > maxX ? maxX : rawX;
        const arrowOffset = rawX - clampedX;

        const wantsAbove = rawY - tipH - 10 >= topPad + TOOLTIP_MARGIN;
        const fitsBelow  = rawY + tipH + 14 <= boundsH - TOOLTIP_MARGIN;
        const place: 'above' | 'below' = wantsAbove ? 'above' : (fitsBelow ? 'below' : 'above');

        return {
            x:           Math.round(clampedX),
            y:           Math.round(rawY),
            place,
            arrowOffset: Math.round(arrowOffset)
        };
    }

    //Lane variant of buildTooltipFromPing: surfaces the full
    //entity name + current value when the cursor is parked over
    //the (potentially clipped) label column. Reuses the same
    //placement / arrow / clamp logic as the ping tooltip so a
    //hover-and-move from a label onto a ping does not flash the
    //bubble.
    private buildTooltipFromLane(
        lane:         Lane,
        canvasX:      number,
        canvasY:      number,
        sourceCanvas: HTMLCanvasElement
    ): TooltipState
    {
        const placement = this.computeTooltipPlacement(canvasX, canvasY, sourceCanvas);

        //Use lane.lastPingTs as the "seen" anchor: it's the
        //timestamp of the most recent change for this entity,
        //which is what a user reading a hovered label naturally
        //wants to know ("when did this last move?").
        const ageMs = Math.max(0, Date.now() - lane.lastPingTs);

        return {
            visible:     true,
            x:           placement.x,
            y:           placement.y,
            place:       placement.place,
            arrowOffset: placement.arrowOffset,
            //pingId is reused as an identity key for the
            //tooltip; we synthesise one from the lane index so
            //the renderer doesn't think the lane tooltip is the
            //same as a freshly hovered ping in the same lane.
            pingId:      -(lane.laneIndex + 1),
            showCount:   false,
            name:        lane.friendlyName,
            entityId:    lane.entityId,
            value:       formatLaneValue(lane.lastState, lane.unit),
            previous:    '',
            ago:         formatAgo(ageMs, this._i18n),
            count:       lane.pingCount,
            color:       lane.color
        };
    }

    //When one strip loses the mouse we only drop the tooltip if
    //it was being driven by *that* strip; otherwise we'd flicker
    //away a tooltip the other canvas is actively showing.
    private maybeHideTooltip(source: 'stage' | 'global'): void
    {
        if (!this._tooltip.visible) return;

        const driverIsGlobal = this._tooltip.showCount;
        if ((source === 'global' && driverIsGlobal) ||
            (source === 'stage'  && !driverIsGlobal))
        {
            this._tooltip = EMPTY_TOOLTIP;
        }
    }
}

//----- helpers -----

function resolveConfig(cfg: HermesCardConfig): ResolvedConfig
{
    const showLabels = cfg.show_labels !== false;
    const labelWidth = showLabels ? clamp(cfg.label_width ?? 150, 0, 320) : 0;
    const valueWidth = clamp(cfg.value_width ?? 64, 0, 200);
    const theme: 'dark' | 'light' = cfg.card_theme === 'light' ? 'light' : 'dark';

    return {
        title:                  (cfg.title ?? 'Activity').trim() || 'Activity',
        theme,
        timespanSeconds:        clamp(cfg.timespan_seconds ?? 300, 10, 24 * 3600),
        globalTimespanSeconds:  clamp(cfg.global_timespan_seconds ?? 60, 5, 3600),
        globalHeight:           clamp(cfg.global_height ?? 72, 32, 200),
        labelWidth,
        valueWidth,
        showLegend:             cfg.show_legend !== false,
        showLastValue:          cfg.show_last_value !== false,
        showGlobal:             cfg.show_global !== false,
        maxPings:               clamp(cfg.max_pings ?? 2000, 50, 20000),
        ignoreUnavailable:      cfg.ignore_unavailable !== false,
        entities:               arrOrUndef(cfg.entities),
        includeDomains:         arrOrUndef(cfg.include_domains) ?? [...DEFAULT_INCLUDE_DOMAINS],
        excludeEntities:        arrOrUndef(cfg.exclude_entities),
        excludeDomains:         arrOrUndef(cfg.exclude_domains)
    };
}

function arrOrUndef(v: unknown): string[] | undefined
{
    if (!Array.isArray(v)) return undefined;
    const clean = v.filter((x): x is string => typeof x === 'string' && x.length > 0);
    return clean.length > 0 ? clean : undefined;
}

function clamp(v: number, lo: number, hi: number): number
{
    if (!Number.isFinite(v)) return lo;
    return v < lo ? lo : v > hi ? hi : v;
}

function withAlpha(hex: HexColor, alpha: number): string
{
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function clipText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string
{
    if (maxWidth <= 0) return '';
    if (ctx.measureText(text).width <= maxWidth) return text;

    const ellipsis = '…';
    let lo = 0;
    let hi = text.length;

    while (lo < hi)
    {
        const mid = (lo + hi + 1) >> 1;
        const candidate = text.slice(0, mid) + ellipsis;
        if (ctx.measureText(candidate).width <= maxWidth)
        {
            lo = mid;
        }
        else
        {
            hi = mid - 1;
        }
    }

    return text.slice(0, lo) + ellipsis;
}

function formatLaneValue(state: string | null, unit: string | null): string
{
    if (state === null || state === '') return '—';

    const n = Number(state);
    if (Number.isFinite(n))
    {
        const formatted = formatNumber(n);
        return unit ? `${formatted} ${unit}` : formatted;
    }

    return state;
}

function formatNumber(n: number): string
{
    if (Math.abs(n) >= 10)
    {
        return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
    }
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatAgo(ms: number, i18n: Translation): string
{
    if (ms < 1500)  return i18n.justNow;
    if (ms < 60_000) return `${Math.round(ms / 1000)} ${i18n.unitSec}`;
    if (ms < 3600_000) return `${Math.round(ms / 60_000)} ${i18n.unitMin}`;
    return `${(ms / 3600_000).toFixed(1)} ${i18n.unitHour}`;
}

function getFontFamily(): string
{
    return 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif';
}

function getMonoFamily(): string
{
    return 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';
}

//Stable FNV-1a-style hash → [0, 1) used to assign each entity a
//repeatable vertical track on the global strip. Same input always
//maps to the same output so a sensor's spheres stack on a single
//line instead of jittering across the row on every ping.
const _entityHashCache = new Map<string, number>();
function entityHash(id: string): number
{
    const cached = _entityHashCache.get(id);
    if (cached !== undefined) return cached;

    let h = 2166136261;
    for (let i = 0; i < id.length; i++)
    {
        h ^= id.charCodeAt(i);
        h = (h * 16777619) >>> 0;
    }
    const norm = h / 4294967296;
    _entityHashCache.set(id, norm);
    return norm;
}

/*
 * Mini variant.
 *
 * Same bundle, same engine, same canvas: only the layout
 * collapses to the top global strip. The `isMini` getter on
 * HermesCard dispatches on tag name (this class) so render() and
 * the grid-option overrides automatically pick the mini path.
 *
 * We override `getStubConfig` so the HA card picker preview shows
 * the right starting config, but everything else is inherited
 * from the full card.
 */
@customElement('hermes-mini-card')
export class HermesMiniCard extends HermesCard
{
    static override getStubConfig(): HermesCardConfig
    {
        return HermesCard.miniStubConfig();
    }
}
