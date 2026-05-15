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

//Install banner, same pattern as Helios. Two flat chips, one
//bundle per dashboard. Inlined version comes from vite.config.ts.
{
    const flagKey = '__hermesBannerPrinted';
    const w = window as unknown as Record<string, unknown>;
    if (!w[flagKey])
    {
        w[flagKey] = true;
        const labelStyle   = 'background:#8b5cf6;color:#0a0c10;padding:2px 8px;border-radius:4px 0 0 4px;font-weight:bold;';
        const versionStyle = 'background:#0a0c10;color:#8b5cf6;padding:2px 8px;border-radius:0 4px 4px 0;font-weight:bold;';
        console.info(
            `%c⚡ HERMES%c v${HERMES_VERSION}`,
            labelStyle,
            versionStyle
        );
    }
}

//YAML config exposed to users. Everything optional, everything
//has a sensible default. The visual editor mirrors this list.
export interface HermesCardConfig
{
    type:                 'custom:hermes-card';
    title?:               string;
    timespan_seconds?:    number;
    height?:              number;   //pixels for the stage; ha-card still wraps it
    label_width?:         number;   //pixels, left gutter for entity labels; 0 hides
    show_labels?:         boolean;  //convenience boolean equivalent to label_width: 0
    show_legend?:         boolean;
    show_last_value?:     boolean;
    max_pings?:           number;
    ignore_unavailable?:  boolean;
    entities?:            string[];
    include_domains?:     string[];
    exclude_entities?:    string[];
    exclude_domains?:     string[];
}

interface ResolvedConfig
{
    title:               string;
    timespanSeconds:     number;
    height:              number;
    labelWidth:          number;
    showLegend:          boolean;
    showLastValue:       boolean;
    maxPings:            number;
    ignoreUnavailable:   boolean;
    entities?:           string[];
    includeDomains?:     string[];
    excludeEntities?:    string[];
    excludeDomains?:     string[];
}

interface TooltipState
{
    visible:   boolean;
    x:         number;
    y:         number;
    pingId:    number;
    name:      string;
    entityId:  string;
    value:     string;
    previous:  string;
    ago:       string;
    color:     HexColor;
}

const EMPTY_TOOLTIP: TooltipState =
{
    visible:  false,
    x:        0,
    y:        0,
    pingId:   0,
    name:     '',
    entityId: '',
    value:    '',
    previous: '',
    ago:      '',
    color:    '#94A3B8'
};

//Layout constants. Sub-pixel-able so the renderer doesn't need
//to round per-frame to look crisp on hi-DPI screens.
const STAGE_PAD_TOP     = 14;
const STAGE_PAD_BOTTOM  = 14;
const STAGE_PAD_RIGHT   = 18;
const LANE_GAP          = 2;
const MIN_LANE_HEIGHT   = 22;
const MAX_LANE_HEIGHT   = 56;
const HIT_RADIUS_PAD    = 6;   //extra px around a ping's radius when hit-testing
const FADE_TAIL_FRAC    = 0.18; //last 18 % of the timespan fades out

@customElement('hermes-card')
export class HermesCard extends LitElement
{
    static override styles = hermesCardStyles;

    //HA hands us a fresh `hass` whenever a state changes. We
    //only care for connection swaps, so we re-bind the engine
    //lazily in updated().
    @property({ attribute: false }) hass?: HassLike;

    @state() private _config: ResolvedConfig = resolveConfig({ type: 'custom:hermes-card' });
    @state() private _tooltip: TooltipState = EMPTY_TOOLTIP;
    @state() private _entityCount = 0;
    @state() private _i18n: Translation = _bootI18n;

    private engine: HermesEngine | null = null;
    private engineUnsubscribe: (() => void) | null = null;

    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private stageEl: HTMLDivElement | null = null;
    private resizeObserver: ResizeObserver | null = null;

    private rafHandle: number = 0;
    private dirty = true;
    private mouseX = -1;
    private mouseY = -1;

    //Backing-store size in CSS px and devicePixelRatio. Recomputed
    //by the ResizeObserver; the renderer reads them once per frame.
    private stageWidth = 0;
    private stageHeight = 0;
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

    setConfig(config: HermesCardConfig | null | undefined): void
    {
        if (!config || typeof config !== 'object')
        {
            throw new Error('Invalid configuration');
        }

        const resolved = resolveConfig(config);

        //Recreate the engine on first config, otherwise just
        //push the new filters through so existing pings keep
        //flowing without a flicker.
        const engineCfg: HermesEngineConfig =
        {
            timespan_seconds:   resolved.timespanSeconds,
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

    //Used by the masonry layout to pre-size the card before
    //first paint. Roughly one row per ~50 px.
    getCardSize(): number
    {
        return Math.max(3, Math.round(this._config.height / 50));
    }

    //----- lifecycle -----

    override connectedCallback(): void
    {
        super.connectedCallback();

        //Pick localisation as soon as we can read the HA
        //language. Default to the boot i18n until then.
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
        this.teardownObserver();
    }

    override updated(changed: PropertyValues): void
    {
        super.updated(changed);

        //Wire DOM-bound dependencies after the first render.
        if (!this.stageEl)
        {
            this.stageEl = this.renderRoot.querySelector('.stage') as HTMLDivElement | null;
        }
        if (!this.canvas)
        {
            this.canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement | null;
            if (this.canvas)
            {
                this.ctx = this.canvas.getContext('2d', { alpha: true });
                this.canvas.addEventListener('mousemove', this.handleMouseMove);
                this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
                this.canvas.addEventListener('touchstart', this.handleTouch, { passive: true });
                this.canvas.addEventListener('touchmove', this.handleTouch, { passive: true });
                this.canvas.addEventListener('touchend', this.handleMouseLeave);
            }
        }
        if (!this.resizeObserver && this.stageEl)
        {
            this.resizeObserver = new ResizeObserver(() => this.handleResize());
            this.resizeObserver.observe(this.stageEl);
            this.handleResize();
        }

        if (changed.has('hass') && this.hass && this.engine)
        {
            this.engine.bind(this.hass);
        }
    }

    //----- render -----

    override render(): TemplateResult
    {
        const cfg = this._config;
        const tt = this._tooltip;

        return html`
            <ha-card>
                <div class="root" style=${`height:${cfg.height}px;`}>
                    <div class="header">
                        <div class="title">${cfg.title}</div>
                        <div class="subtitle">
                            ${this._entityCount} ${this._entityCount === 1 ? this._i18n.entity : this._i18n.entities}
                        </div>
                        <div class="spacer"></div>
                        ${cfg.showLegend ? this.renderLegend() : nothing}
                    </div>
                    <div class="stage">
                        <canvas></canvas>
                        ${this._entityCount === 0 ? this.renderEmpty() : nothing}
                        ${tt.visible ? this.renderTooltip(tt) : nothing}
                    </div>
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
        return html`
            <div
                class="tooltip visible"
                style=${`left:${tt.x}px;top:${tt.y}px;border-color:${withAlpha(tt.color, 0.4)};`}
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
                <div class="tt-arrow"></div>
            </div>
        `;
    }

    //----- canvas / animation -----

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

    private teardownObserver(): void
    {
        if (this.resizeObserver)
        {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        if (this.canvas)
        {
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
            this.canvas.removeEventListener('touchstart', this.handleTouch);
            this.canvas.removeEventListener('touchmove', this.handleTouch);
            this.canvas.removeEventListener('touchend', this.handleMouseLeave);
        }
    }

    private handleResize = (): void =>
    {
        if (!this.stageEl || !this.canvas) return;

        const rect = this.stageEl.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

        const w = Math.max(0, Math.floor(rect.width));
        const h = Math.max(0, Math.floor(rect.height));

        if (this.stageWidth === w && this.stageHeight === h && this.dpr === dpr)
        {
            return;
        }

        this.stageWidth = w;
        this.stageHeight = h;
        this.dpr = dpr;

        this.canvas.width  = Math.max(1, Math.floor(w * dpr));
        this.canvas.height = Math.max(1, Math.floor(h * dpr));
        this.canvas.style.width  = `${w}px`;
        this.canvas.style.height = `${h}px`;

        this.dirty = true;
    };

    private handleMouseMove = (ev: MouseEvent): void =>
    {
        const rect = (ev.currentTarget as HTMLCanvasElement).getBoundingClientRect();
        this.mouseX = ev.clientX - rect.left;
        this.mouseY = ev.clientY - rect.top;
        this.dirty = true;
    };

    private handleMouseLeave = (): void =>
    {
        this.mouseX = -1;
        this.mouseY = -1;
        if (this._tooltip.visible)
        {
            this._tooltip = EMPTY_TOOLTIP;
        }
        this.dirty = true;
    };

    private handleTouch = (ev: TouchEvent): void =>
    {
        if (!ev.touches.length || !this.canvas) return;
        const t = ev.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = t.clientX - rect.left;
        this.mouseY = t.clientY - rect.top;
        this.dirty = true;
    };

    private paint(): void
    {
        if (!this.ctx || !this.canvas || !this.engine) return;
        if (this.stageWidth === 0 || this.stageHeight === 0) return;

        //Active pings need a fresh frame because they're moving.
        //If everything is static we still want to refresh the
        //tooltip when the mouse moves, so we honour the `dirty`
        //flag set by event handlers.
        const snapshot = this.engine.getSnapshot();
        const hasMotion = snapshot.pings.length > 0;
        if (!hasMotion && !this.dirty) return;
        this.dirty = false;

        const ctx = this.ctx;
        const cfg = this._config;

        ctx.save();
        ctx.scale(this.dpr, this.dpr);
        ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);

        //Layout: vertical lanes, capped to MAX/MIN heights so we
        //read like a heartbeat trace at any card size.
        const lanes = snapshot.lanes;
        const laneCount = Math.max(1, lanes.length);
        const labelW = cfg.labelWidth;
        const innerLeft   = labelW;
        const innerRight  = this.stageWidth - STAGE_PAD_RIGHT;
        const innerTop    = STAGE_PAD_TOP;
        const innerBottom = this.stageHeight - STAGE_PAD_BOTTOM;
        const innerHeight = Math.max(0, innerBottom - innerTop);
        const innerWidth  = Math.max(0, innerRight - innerLeft);

        let laneHeight = innerHeight / laneCount - LANE_GAP;
        laneHeight = Math.max(MIN_LANE_HEIGHT, Math.min(MAX_LANE_HEIGHT, laneHeight));

        const usedHeight = laneHeight * laneCount + LANE_GAP * (laneCount - 1);
        const yStart = innerTop + Math.max(0, (innerHeight - usedHeight) / 2);

        //Resolve each entity to a (y, h) box so the renderer
        //doesn't recompute it twice (lane track + ping draw).
        const laneByEntity = new Map<string, { y: number; h: number; color: HexColor; lane: Lane }>();
        for (let i = 0; i < lanes.length; i++)
        {
            const lane = lanes[i];
            const y = yStart + i * (laneHeight + LANE_GAP) + laneHeight / 2;
            laneByEntity.set(lane.entityId, { y, h: laneHeight, color: lane.color, lane });
        }

        //Dashed lane tracks + entity labels.
        this.drawLaneTracks(ctx, lanes, laneByEntity, innerLeft, innerRight, labelW);

        //Pings, oldest first so newer ones glow over older ones.
        const timespanMs = snapshot.timespanMs;
        const now = snapshot.now;

        //We accumulate the best hit-tested ping so the tooltip
        //picks the closest visible sphere instead of the one
        //drawn last.
        let bestHit: { ping: Ping; dist: number; x: number; y: number; r: number } | null = null;

        for (let i = 0; i < snapshot.pings.length; i++)
        {
            const p = snapshot.pings[i];
            const lane = laneByEntity.get(p.entityId);
            if (!lane) continue;

            const ageMs = now - p.ts;
            const frac = ageMs / timespanMs;  //0 = just emitted, 1 = at left edge
            if (frac < 0 || frac > 1) continue;

            const x = innerRight - frac * innerWidth;
            const y = lane.y;

            const baseR = lane.h * 0.34;
            const r = Math.max(2.5, baseR * (0.5 + p.magnitude * 0.6));

            //Fade only the last sliver of the timeline so the
            //bulk of the run keeps full presence.
            const tailFrac = Math.max(0, (frac - (1 - FADE_TAIL_FRAC)) / FADE_TAIL_FRAC);
            const alpha = 1 - tailFrac;

            this.drawPing(ctx, x, y, r, p.color, alpha);

            //Hit test against the cursor.
            if (this.mouseX >= 0)
            {
                const dx = x - this.mouseX;
                const dy = y - this.mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const reach = r + HIT_RADIUS_PAD;
                if (dist <= reach && (!bestHit || dist < bestHit.dist))
                {
                    bestHit = { ping: p, dist, x, y, r };
                }
            }
        }

        ctx.restore();

        //Tooltip update. Doing this after paint() means the
        //tooltip lags one frame behind a fast mouse, which is
        //imperceptible at 60 fps but keeps the loop tight.
        if (bestHit)
        {
            this.setTooltipFromPing(bestHit.ping, bestHit.x, bestHit.y, bestHit.r);
        }
        else if (this._tooltip.visible)
        {
            this._tooltip = EMPTY_TOOLTIP;
        }
    }

    private drawLaneTracks(
        ctx:           CanvasRenderingContext2D,
        lanes:         readonly Lane[],
        laneByEntity:  Map<string, { y: number; h: number; color: HexColor; lane: Lane }>,
        innerLeft:     number,
        innerRight:    number,
        labelW:        number
    ): void
    {
        const cfg = this._config;
        const labelFont = '500 11px ' + getFontFamily();
        const valueFont = '400 10.5px ' + getMonoFamily();
        const dimColor = 'rgba(255,255,255,0.55)';
        const muteColor = 'rgba(255,255,255,0.35)';

        ctx.lineWidth = 1;
        ctx.setLineDash([1.5, 4]);

        for (const lane of lanes)
        {
            const slot = laneByEntity.get(lane.entityId);
            if (!slot) continue;

            //Lane separator: a soft dashed rule on the lane's
            //centreline, tinted with the channel colour so the
            //timeline reads as channel-grouped even when empty.
            ctx.strokeStyle = withAlpha(lane.color, 0.18);
            ctx.beginPath();
            ctx.moveTo(innerLeft, slot.y);
            ctx.lineTo(innerRight, slot.y);
            ctx.stroke();

            if (labelW > 0)
            {
                //Channel-coloured dot to the left of the label.
                ctx.setLineDash([]);
                ctx.fillStyle = lane.color;
                ctx.beginPath();
                ctx.arc(12, slot.y, 3.2, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = dimColor;
                ctx.font = labelFont;
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'left';
                ctx.fillText(
                    clipText(ctx, lane.friendlyName, labelW - 26 - (cfg.showLastValue ? 48 : 0)),
                    22,
                    slot.y
                );

                if (cfg.showLastValue && lane.lastState !== null)
                {
                    ctx.fillStyle = muteColor;
                    ctx.font = valueFont;
                    ctx.textAlign = 'right';
                    const valueStr = formatLaneValue(lane.lastState, lane.unit);
                    ctx.fillText(
                        clipText(ctx, valueStr, 60),
                        labelW - 8,
                        slot.y
                    );
                }

                ctx.setLineDash([1.5, 4]);
            }
        }

        ctx.setLineDash([]);
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
        //Halo + body. A radial gradient gives the sphere a soft
        //bloom that reads as "energy" against the dark plate, and
        //the additive layering means clusters of recent pings
        //naturally brighten without us having to special-case it.
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

        //Bright pinprick centre to give the sphere a focal
        //highlight; small enough that it disappears on tiny
        //magnitude pings without us thresholding.
        ctx.fillStyle = `rgba(255, 255, 255, ${0.65 * alpha})`;
        ctx.beginPath();
        ctx.arc(x - r * 0.25, y - r * 0.25, Math.max(0.6, r * 0.18), 0, Math.PI * 2);
        ctx.fill();
    }

    private setTooltipFromPing(p: Ping, x: number, y: number, _r: number): void
    {
        const ageMs = Date.now() - p.ts;
        const ago = formatAgo(ageMs, this._i18n);

        const valueStr = formatLaneValue(p.newState, p.unit);
        const prevStr  = p.oldState !== null ? formatLaneValue(p.oldState, p.unit) : '';

        const next: TooltipState =
        {
            visible:  true,
            x:        Math.round(x),
            y:        Math.round(y),
            pingId:   p.id,
            name:     p.friendlyName,
            entityId: p.entityId,
            value:    valueStr,
            previous: prevStr,
            ago,
            color:    p.color
        };

        //Avoid re-rendering when nothing changed (mouse hovering
        //the same ping for several frames).
        if (
            this._tooltip.pingId === next.pingId &&
            this._tooltip.x === next.x &&
            this._tooltip.y === next.y &&
            this._tooltip.value === next.value &&
            this._tooltip.ago === next.ago
        )
        {
            return;
        }

        this._tooltip = next;
    }
}

//----- helpers -----

function resolveConfig(cfg: HermesCardConfig): ResolvedConfig
{
    const showLabels = cfg.show_labels !== false;
    const labelWidth = showLabels ? clamp(cfg.label_width ?? 168, 0, 320) : 0;

    return {
        title:             (cfg.title ?? 'Activity').trim() || 'Activity',
        timespanSeconds:   clamp(cfg.timespan_seconds ?? 300, 10, 24 * 3600),
        height:            clamp(cfg.height ?? 320, 140, 1200),
        labelWidth,
        showLegend:        cfg.show_legend !== false,
        showLastValue:     cfg.show_last_value !== false,
        maxPings:          clamp(cfg.max_pings ?? 2000, 50, 20000),
        ignoreUnavailable: cfg.ignore_unavailable !== false,
        entities:          arrOrUndef(cfg.entities),
        includeDomains:    arrOrUndef(cfg.include_domains) ?? [...DEFAULT_INCLUDE_DOMAINS],
        excludeEntities:   arrOrUndef(cfg.exclude_entities),
        excludeDomains:    arrOrUndef(cfg.exclude_domains)
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

//Convert a "#RRGGBB" + 0..1 alpha into an rgba() string. The
//tooltip border, lane separators and ping halos all need this
//and the alternative (parsing on every call) is slower than
//just doing the substring slice once.
function withAlpha(hex: HexColor, alpha: number): string
{
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function clipText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string
{
    if (maxWidth <= 0 || ctx.measureText(text).width <= maxWidth)
    {
        return text;
    }

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
    if (Math.abs(n) >= 1000)
    {
        return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
    }
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
