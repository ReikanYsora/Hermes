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

//Install banner, same shape and dimensions as the Helios one so
//the two cards line up visually when both are loaded on the same
//dashboard. The caduceus glyph (☤ U+2624) sits in the same
//"Miscellaneous Symbols" block as Helios's ☀, so browsers render
//it as a monochrome text dingbat rather than a chunky emoji.
{
    const flagKey = '__hermesBannerPrinted';
    const w = window as unknown as Record<string, unknown>;
    if (!w[flagKey])
    {
        w[flagKey] = true;
        const labelStyle   = 'background:#8b5cf6;color:#1f2937;padding:2px 8px;border-radius:4px 0 0 4px;font-weight:bold;';
        const versionStyle = 'background:#1f2937;color:#8b5cf6;padding:2px 8px;border-radius:0 4px 4px 0;font-weight:bold;';
        console.info(
            `%c☤ HERMES%c v${HERMES_VERSION}`,
            labelStyle,
            versionStyle
        );
        console.info(
            `%c☤ HERMES%c watching every entity state change on this dashboard`,
            labelStyle,
            'color:#6b7280;font-style:italic;'
        );
    }
}

//YAML config exposed to users. Everything optional, everything
//has a sensible default. The visual editor mirrors this list.
//
//`height` is intentionally absent: the card stretches to fill
//whatever its container hands it, matching Helios. Users size
//Hermes via the sections grid / masonry / panel layout in HA
//itself, not from the card YAML.
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

//Tooltip width / height estimates used for viewport clamping.
//These match the CSS min/max budgets in hermes-card-css.ts; if
//the tooltip overflows in practice (very long entity names),
//`max-width: 280px` in CSS caps the bubble and the arrow stays
//close to its anchor via the CSS variable below.
const TOOLTIP_HALF_W   = 110;
const TOOLTIP_H        = 110;
const TOOLTIP_MARGIN   = 8;

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

    private engine: HermesEngine | null = null;
    private engineUnsubscribe: (() => void) | null = null;

    //DOM handles, wired in updated() once the shadow root has
    //rendered.
    private rootEl: HTMLDivElement | null = null;
    private stageEl: HTMLDivElement | null = null;
    private stageCanvas: HTMLCanvasElement | null = null;
    private stageCtx: CanvasRenderingContext2D | null = null;
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
            if (this.stageEl)
            {
                this.stageEl.addEventListener('scroll', this.handleScroll, { passive: true });
            }
        }
        if (!this.spacerEl)
        {
            this.spacerEl = this.renderRoot.querySelector('.stage-spacer') as HTMLDivElement | null;
        }
        if (!this.stageCanvas)
        {
            this.stageCanvas = this.renderRoot.querySelector('.stage-pin canvas') as HTMLCanvasElement | null;
            if (this.stageCanvas)
            {
                this.stageCtx = this.stageCanvas.getContext('2d', { alpha: true });
                this.stageCanvas.addEventListener('mousemove', this.handleStageMouseMove);
                this.stageCanvas.addEventListener('mouseleave', this.handleStageMouseLeave);
                this.stageCanvas.addEventListener('touchstart', this.handleStageTouch, { passive: true });
                this.stageCanvas.addEventListener('touchmove', this.handleStageTouch, { passive: true });
                this.stageCanvas.addEventListener('touchend', this.handleStageMouseLeave);
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
                        </div>
                        <div class="divider"></div>
                    ` : nothing}

                    <div class="stage">
                        <div class="stage-pin">
                            <canvas></canvas>
                        </div>
                        <div class="stage-spacer"></div>
                    </div>

                    ${this._entityCount === 0 ? this.renderEmpty() : nothing}
                    ${tt.visible ? this.renderTooltip(tt) : nothing}
                </div>
            </ha-card>
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
        if (!this.stageEl) return;
        this.stageScrollY = this.stageEl.scrollTop;
        this.dirty = true;
    };

    private handleStageMouseMove = (ev: MouseEvent): void =>
    {
        if (!this.stageCanvas) return;
        const r = this.stageCanvas.getBoundingClientRect();
        this.stageMouse = { x: ev.clientX - r.left, y: ev.clientY - r.top };
        this.dirty = true;
    };

    private handleStageMouseLeave = (): void =>
    {
        this.stageMouse = { x: -1, y: -1 };
        this.maybeHideTooltip('stage');
        this.dirty = true;
    };

    private handleStageTouch = (ev: TouchEvent): void =>
    {
        if (!ev.touches.length || !this.stageCanvas) return;
        const t = ev.touches[0];
        const r = this.stageCanvas.getBoundingClientRect();
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
        const loop = () =>
        {
            this.rafHandle = requestAnimationFrame(loop);
            this.paint();
        };
        this.rafHandle = requestAnimationFrame(loop);
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

    private teardownDom(): void
    {
        if (this.resizeObserver)
        {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        if (this.stageEl)
        {
            this.stageEl.removeEventListener('scroll', this.handleScroll);
        }
        if (this.stageCanvas)
        {
            this.stageCanvas.removeEventListener('mousemove', this.handleStageMouseMove);
            this.stageCanvas.removeEventListener('mouseleave', this.handleStageMouseLeave);
            this.stageCanvas.removeEventListener('touchstart', this.handleStageTouch);
            this.stageCanvas.removeEventListener('touchmove', this.handleStageTouch);
            this.stageCanvas.removeEventListener('touchend', this.handleStageMouseLeave);
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

        const snapshot = this.engine.getSnapshot();
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

            const baseR = LANE_INNER * 0.34;
            const r = Math.max(2.5, baseR * (0.5 + p.magnitude * 0.6));

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
            return this.buildTooltipFromPing(bestHit.ping, bestHit.x, bestHit.y, this.stageCanvas, false);
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
        const maxR = Math.min(14, (this.globalH - GLOBAL_INNER_PAD * 2) * 0.45);
        const baseR = 1.8;
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
            //for an entity gets a slightly larger sphere than the
            //previous, up to maxR. Log scale so a sensor pinging
            //a thousand times doesn't dominate.
            const r = Math.min(maxR, baseR + Math.log2(p.pingIndex + 1) * 1.6);

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
            return this.buildTooltipFromPing(bestHit.ping, bestHit.x, bestHit.y, this.globalCanvas, true);
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
        const haloR = r * 2.8;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, haloR);
        gradient.addColorStop(0,    withAlpha(color, 0.55 * alpha));
        gradient.addColorStop(0.35, withAlpha(color, 0.20 * alpha));
        gradient.addColorStop(1,    withAlpha(color, 0));

        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, haloR, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        ctx.fillStyle = withAlpha(color, 0.95 * alpha);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${0.65 * alpha})`;
        ctx.beginPath();
        ctx.arc(x - r * 0.25, y - r * 0.25, Math.max(0.6, r * 0.18), 0, Math.PI * 2);
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
        const rootRect = this.rootEl?.getBoundingClientRect();
        const canvasRect = sourceCanvas.getBoundingClientRect();
        const rootW = rootRect?.width  ?? this.stageW;
        const rootH = rootRect?.height ?? this.stageH;

        const rawX = (canvasRect.left - (rootRect?.left ?? 0)) + canvasX;
        const rawY = (canvasRect.top  - (rootRect?.top  ?? 0)) + canvasY;

        //Clamp x so the bubble never overflows the card's left
        //or right edge. arrowOffset preserves the visual link to
        //the sphere when we have to shift the bubble back inward.
        const minX = TOOLTIP_MARGIN + TOOLTIP_HALF_W;
        const maxX = Math.max(minX, rootW - TOOLTIP_MARGIN - TOOLTIP_HALF_W);
        const clampedX = rawX < minX ? minX : rawX > maxX ? maxX : rawX;
        const arrowOffset = rawX - clampedX;

        //If there isn't enough room above (rawY - TOOLTIP_H - 10
        //would clip through the top), flip below the anchor. The
        //bottom-side check is symmetric.
        const wantsAbove = rawY - TOOLTIP_H - 10 >= TOOLTIP_MARGIN;
        const fitsBelow  = rawY + TOOLTIP_H + 14 <= rootH - TOOLTIP_MARGIN;
        const place: 'above' | 'below' = wantsAbove ? 'above' : (fitsBelow ? 'below' : 'above');

        const ageMs = Date.now() - p.ts;

        return {
            visible:     true,
            x:           Math.round(clampedX),
            y:           Math.round(rawY),
            place,
            arrowOffset: Math.round(arrowOffset),
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
