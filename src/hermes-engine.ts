/*
 * Hermes engine.
 *
 * Owns the live data the card draws:
 *   - subscribes to Home Assistant's `state_changed` event bus,
 *   - filters incoming changes against the user's YAML config,
 *   - converts each accepted change into a "ping" (a coloured
 *     sphere with a magnitude),
 *   - keeps pings in a bounded ring buffer trimmed to the visible
 *     timespan,
 *   - assigns each emitting entity a stable lane index so the
 *     vertical layout does not jump when a new entity appears.
 *
 * The renderer reads `getSnapshot()` once per frame, never mutates
 * engine state, and reacts to `onUpdate` so a tab in the background
 * does not spin requestAnimationFrame when nothing has happened.
 *
 * No DOM, no Lit. Keeping this layer free of rendering concerns
 * makes the engine trivially testable and lets the card swap its
 * paint strategy (canvas, SVG, WebGL) without touching this file.
 */

import
{
    type Channel,
    type HexColor,
    type MagnitudeContext,
    channelFor,
    colorFor,
    domainOf,
    magnitudeFor,
    updateDeltaEma
} from './hermes-types';

//Public configuration the engine cares about. The card and the
//editor share a wider config (title, theme, height, ...) but only
//these fields affect what gets recorded.
export interface HermesEngineConfig
{
    //Explicit entity list. When set, only these entities are
    //tracked. Glob patterns ("light.*", "sensor.kitchen_*") are
    //expanded against the current state list.
    entities?: string[];

    //Domain allow-list, used when `entities` is empty. Defaults
    //to a sensible "everything human-visible" set.
    include_domains?: string[];

    //Hard excludes, applied after the include rules. Useful to
    //silence chatty sensors (uptime, last_seen, ...) without
    //having to enumerate everything else.
    exclude_entities?: string[];

    exclude_domains?: string[];

    //Drop ping events whose only effect was a state change of
    //`unavailable` <-> `unknown` <-> real-value. These are
    //connectivity blips, not user-visible state changes, and
    //they tend to flood the timeline on integration restarts.
    ignore_unavailable?: boolean;

    //Visible window in seconds. Pings older than this are
    //evicted on every snapshot. Defaults to 300 (5 min) but the
    //card forwards the user's value here.
    timespan_seconds: number;

    //Hard cap on retained pings. Acts as a safety net for cases
    //where a misconfigured entity emits faster than the
    //timespan would naturally evict. FIFO eviction.
    max_pings: number;
}

//Default include set: domains a human would meaningfully look at
//in a live dashboard. Update entities and timer ticks are noisy
//and excluded by default; users can opt them back in.
export const DEFAULT_INCLUDE_DOMAINS: readonly string[] =
[
    'binary_sensor',
    'sensor',
    'switch',
    'light',
    'climate',
    'cover',
    'lock',
    'media_player',
    'person',
    'device_tracker',
    'weather',
    'automation',
    'script',
    'button',
    'input_boolean',
    'input_number',
    'input_select',
    'input_text',
    'input_button',
    'vacuum',
    'fan',
    'humidifier',
    'water_heater',
    'remote',
    'siren',
    'alarm_control_panel',
    'scene'
];

//A single state change made visible. `id` is monotonic so the
//renderer can use it as a stable key across animation frames
//without rehashing entity + ts on every paint. `pingIndex` is the
//ordinal of this ping for its own entity (1 = first ever, 2 =
//second, ...) - the global timeline reads it to scale the sphere
//up as an entity grows chattier across the session.
export interface Ping
{
    id:           number;
    entityId:     string;
    friendlyName: string;
    channel:      Channel;
    color:        HexColor;
    magnitude:    number;
    pingIndex:    number;
    oldState:     string | null;
    newState:     string | null;
    unit:         string | null;
    ts:           number;  //ms epoch
}

//One row of the timeline. `laneIndex` is the slot the renderer
//paints into, top to bottom, with no gaps. `pingCount` is the
//running total of pings recorded for this entity since the card
//was mounted - exposed so the editor / header can surface the
//chattiest entities.
export interface Lane
{
    entityId:     string;
    friendlyName: string;
    channel:      Channel;
    color:        HexColor;
    laneIndex:    number;
    lastPingTs:   number;
    lastState:    string | null;
    unit:         string | null;
    pingCount:    number;
}

//Per-entity bookkeeping the engine keeps so magnitudeFor() can
//grade the next change against its own history.
interface EntityStats
{
    lastState: string | null;
    deltaEma:  number;
}

//Minimum HA shape we depend on. Typed inline to avoid pulling
//a heavy `home-assistant-js-websocket` dependency just for the
//two methods we actually call.
export interface HassLike
{
    states: Record<string, HassEntity>;
    connection:
    {
        subscribeEvents(
            callback: (event: HassStateChangedEvent) => void,
            eventType: string
        ): Promise<() => void>;
    };
}

export interface HassEntity
{
    entity_id:   string;
    state:       string;
    attributes:  Record<string, unknown>;
    last_changed?: string;
}

export interface HassStateChangedEvent
{
    event_type: 'state_changed';
    data:
    {
        entity_id: string;
        new_state: HassEntity | null;
        old_state: HassEntity | null;
    };
    time_fired?: string;
}

//Read-only view passed to the renderer once per frame.
export interface EngineSnapshot
{
    pings:        readonly Ping[];
    lanes:        readonly Lane[];
    now:          number;
    timespanMs:   number;
}

export class HermesEngine
{
    private cfg: HermesEngineConfig;
    private hass: HassLike | null = null;

    private unsubscribe: (() => void) | null = null;
    private pendingSub: Promise<() => void> | null = null;

    //Ring buffer + lane registry. Both grow as entities appear
    //and stay stable across config tweaks unless the user
    //removes an entity from the allow list.
    private readonly pings: Ping[] = [];
    private readonly lanes = new Map<string, Lane>();
    private readonly stats = new Map<string, EntityStats>();
    private nextPingId = 1;
    private nextLaneIndex = 0;

    //Compiled glob patterns from `entities`. Plain strings turn
    //into exact matches; anything containing `*` or `?` is
    //compiled to a RegExp.
    private explicitEntities: Set<string> | null = null;
    private entityPatterns: RegExp[] = [];

    private excludeEntities = new Set<string>();
    private excludeDomains  = new Set<string>();
    private includeDomains: Set<string> = new Set(DEFAULT_INCLUDE_DOMAINS);

    private readonly listeners = new Set<() => void>();

    constructor(cfg: HermesEngineConfig)
    {
        this.cfg = cfg;
        this.recompileFilters();
    }

    //----- public API -----

    setConfig(cfg: HermesEngineConfig): void
    {
        this.cfg = cfg;
        this.recompileFilters();
        this.evictByCap();
        this.notify();
    }

    getConfig(): HermesEngineConfig
    {
        return this.cfg;
    }

    //Bind to a hass object. Idempotent: a second call with the
    //same instance is a no-op. Reconnects if the instance has
    //changed (HA hands cards a fresh `hass` per WebSocket reset).
    bind(hass: HassLike): void
    {
        if (this.hass === hass)
        {
            return;
        }

        this.unbind();
        this.hass = hass;

        //subscribeEvents returns a promise resolving to the
        //unsubscriber. Park the promise so we can cancel even
        //if bind/unbind race during reconnects.
        this.pendingSub = hass.connection.subscribeEvents(
            (ev) => this.handleStateChanged(ev),
            'state_changed'
        );

        this.pendingSub.then((unsub) =>
        {
            //If unbind was called while the subscription was
            //resolving, tear it down immediately.
            if (this.hass !== hass)
            {
                unsub();
                return;
            }
            this.unsubscribe = unsub;
        }).catch((err) =>
        {
            console.warn('[hermes] subscribeEvents failed:', err);
        });
    }

    unbind(): void
    {
        if (this.unsubscribe)
        {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        this.pendingSub = null;
        this.hass = null;
    }

    //Subscribe to "state changed" notifications. Returns the
    //unsubscriber. The engine debounces nothing on purpose: the
    //card itself only schedules a frame when something happened.
    onUpdate(callback: () => void): () => void
    {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    //One-shot read for the renderer. The returned arrays are the
    //engine's own storage, marked readonly at the type level so
    //the renderer cannot mutate them by accident.
    getSnapshot(): EngineSnapshot
    {
        const now = Date.now();
        const timespanMs = Math.max(1000, this.cfg.timespan_seconds * 1000);

        //Evict expired pings up-front so the renderer doesn't
        //have to filter on every paint.
        this.evictExpired(now, timespanMs);

        return {
            pings:      this.pings,
            lanes:      this.computeOrderedLanes(),
            now,
            timespanMs
        };
    }

    //Friendly count of distinct entities that have pinged. Used
    //by the editor preview.
    getLaneCount(): number
    {
        return this.lanes.size;
    }

    //Manually inject a ping. Useful for the editor preview where
    //we want a demo without a real hass connection.
    injectDemoPing(entityId: string, newState: string, oldState: string | null = null): void
    {
        this.recordPing(entityId, oldState, newState, null, null);
        this.notify();
    }

    //----- internals -----

    private recompileFilters(): void
    {
        const list = this.cfg.entities;

        if (list && list.length > 0)
        {
            this.explicitEntities = new Set<string>();
            this.entityPatterns = [];

            for (const raw of list)
            {
                if (raw.includes('*') || raw.includes('?'))
                {
                    this.entityPatterns.push(globToRegExp(raw));
                }
                else
                {
                    this.explicitEntities.add(raw);
                }
            }
        }
        else
        {
            this.explicitEntities = null;
            this.entityPatterns = [];
        }

        this.includeDomains  = new Set(this.cfg.include_domains ?? DEFAULT_INCLUDE_DOMAINS);
        this.excludeEntities = new Set(this.cfg.exclude_entities ?? []);
        this.excludeDomains  = new Set(this.cfg.exclude_domains ?? []);
    }

    private accepts(entityId: string): boolean
    {
        if (this.excludeEntities.has(entityId))
        {
            return false;
        }

        const domain = domainOf(entityId);

        if (this.excludeDomains.has(domain))
        {
            return false;
        }

        //Explicit entity list takes precedence over domain rules.
        if (this.explicitEntities !== null || this.entityPatterns.length > 0)
        {
            if (this.explicitEntities?.has(entityId))
            {
                return true;
            }

            for (const re of this.entityPatterns)
            {
                if (re.test(entityId))
                {
                    return true;
                }
            }

            return false;
        }

        return this.includeDomains.has(domain);
    }

    private handleStateChanged(ev: HassStateChangedEvent): void
    {
        const { entity_id, new_state, old_state } = ev.data;

        if (!this.accepts(entity_id))
        {
            return;
        }

        const newRaw = new_state?.state ?? null;
        const oldRaw = old_state?.state ?? null;

        //Avoid pings for identical states (HA emits these on
        //attribute-only changes; we only care about value).
        if (newRaw === oldRaw)
        {
            return;
        }

        if (this.cfg.ignore_unavailable !== false)
        {
            if (isConnectivityBlip(oldRaw, newRaw))
            {
                return;
            }
        }

        const friendly = (new_state?.attributes?.friendly_name as string | undefined)
                      ?? (old_state?.attributes?.friendly_name as string | undefined)
                      ?? entity_id;

        const unit = (new_state?.attributes?.unit_of_measurement as string | undefined) ?? null;

        this.recordPing(entity_id, oldRaw, newRaw, friendly, unit);
        this.notify();
    }

    private recordPing(
        entityId: string,
        oldRaw:   string | null,
        newRaw:   string | null,
        friendly: string | null,
        unit:     string | null
    ): void
    {
        const channel = channelFor(entityId, newRaw);
        const color   = colorFor(entityId, newRaw);

        //Pull or seed per-entity stats so the magnitude scoring
        //has a baseline before the first hit.
        let s = this.stats.get(entityId);
        if (!s)
        {
            s = { lastState: oldRaw, deltaEma: 0 };
            this.stats.set(entityId, s);
        }

        const a = Number(oldRaw);
        const b = Number(newRaw);
        if (Number.isFinite(a) && Number.isFinite(b))
        {
            s.deltaEma = updateDeltaEma(s.deltaEma, Math.abs(b - a));
        }
        s.lastState = newRaw;

        const ctx: MagnitudeContext = { deltaEma: s.deltaEma };
        const magnitude = magnitudeFor(channel, oldRaw, newRaw, ctx);

        const finalFriendly = friendly ?? entityId;

        //Lane bookkeeping: assign on first sight, refresh
        //metadata (friendly name, current state, colour) on
        //every hit so renames + value tracking stay live.
        let lane = this.lanes.get(entityId);
        if (!lane)
        {
            lane = {
                entityId,
                friendlyName: finalFriendly,
                channel,
                color,
                laneIndex:    this.nextLaneIndex++,
                lastPingTs:   Date.now(),
                lastState:    newRaw,
                unit,
                pingCount:    0
            };
            this.lanes.set(entityId, lane);
        }
        else
        {
            lane.friendlyName = finalFriendly;
            lane.channel      = channel;
            lane.color        = color;
            lane.lastPingTs   = Date.now();
            lane.lastState    = newRaw;
            if (unit !== null) lane.unit = unit;
        }

        lane.pingCount++;

        this.pings.push({
            id:           this.nextPingId++,
            entityId,
            friendlyName: finalFriendly,
            channel,
            color,
            magnitude,
            pingIndex:    lane.pingCount,
            oldState:     oldRaw,
            newState:     newRaw,
            unit:         unit ?? lane.unit,
            ts:           Date.now()
        });

        this.evictByCap();
    }

    //Drop pings older than the visible window. Cheap because
    //the buffer is roughly time-ordered (state_changed events
    //arrive monotonically and we only ever push to the tail).
    private evictExpired(now: number, timespanMs: number): void
    {
        const cutoff = now - timespanMs;
        let drop = 0;

        while (drop < this.pings.length && this.pings[drop].ts < cutoff)
        {
            drop++;
        }

        if (drop > 0)
        {
            this.pings.splice(0, drop);
        }
    }

    private evictByCap(): void
    {
        const over = this.pings.length - this.cfg.max_pings;
        if (over > 0)
        {
            this.pings.splice(0, over);
        }
    }

    //Lanes are stored unordered (insertion order via Map). Most
    //of the time we want them sorted by laneIndex; do it lazily
    //so the engine stays cheap to mutate.
    private computeOrderedLanes(): Lane[]
    {
        const arr = Array.from(this.lanes.values());
        arr.sort((a, b) => a.laneIndex - b.laneIndex);
        return arr;
    }

    private notify(): void
    {
        for (const cb of this.listeners)
        {
            try
            {
                cb();
            }
            catch (err)
            {
                console.warn('[hermes] listener threw:', err);
            }
        }
    }
}

//Compile a HA-style glob ("light.kitchen_*", "sensor.*_temperature")
//to a RegExp. Only `*` and `?` are recognised; everything else is
//escaped so dots and underscores stay literal.
function globToRegExp(glob: string): RegExp
{
    const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const pattern = escaped.replace(/\*/g, '.*').replace(/\?/g, '.');
    return new RegExp(`^${pattern}$`);
}

//True when both states are within {null, '', 'unavailable',
//'unknown'} OR the transition is between such a state and a
//real value. These are connectivity blips that the timeline
//probably shouldn't shout about.
function isConnectivityBlip(oldRaw: string | null, newRaw: string | null): boolean
{
    const a = isMissingState(oldRaw);
    const b = isMissingState(newRaw);
    return a || b;
}

function isMissingState(s: string | null): boolean
{
    return s === null || s === '' || s === 'unavailable' || s === 'unknown';
}

//Version banner constant, re-exported here so the entrypoint can
//log it without reaching across the whole tree.
export const HERMES_VERSION = __HERMES_VERSION__;
