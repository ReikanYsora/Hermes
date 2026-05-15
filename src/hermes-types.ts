/*
 * Hermes type system.
 *
 * Centralises everything that maps a Home Assistant entity to a
 * visual identity on the timeline: a colour for the kind of thing
 * it is, a magnitude in [0..1] for the kind of change that just
 * happened, and a few utilities used by both the engine and the
 * renderer.
 *
 * No DOM, no Lit. Pure data so the engine can call it in a tight
 * loop without dragging the render layer in.
 */

//Hex strings without alpha. The renderer applies opacity itself
//based on age, hover and brightness, so palette entries stay
//atomic and easy to override from YAML.
export type HexColor = `#${string}`;

//Channel groups a domain into one visual family. Several domains
//share a channel when they convey the same kind of information
//(e.g. switch + input_boolean + automation all flip on/off), so
//the eye does not have to learn a dozen unrelated hues.
export type Channel =
    | 'binary'      //binary_sensor
    | 'numeric'     //sensor (numeric state)
    | 'text'        //sensor (string state) + input_text / input_select
    | 'switch'      //switch + input_boolean
    | 'light'       //light
    | 'climate'     //climate + water_heater
    | 'cover'       //cover + garage
    | 'lock'        //lock
    | 'media'       //media_player + remote
    | 'presence'    //person + device_tracker + zone
    | 'weather'     //weather + sun
    | 'system'      //automation + script + scene
    | 'trigger'     //button + input_button + event
    | 'alarm'       //alarm_control_panel + siren
    | 'appliance'   //vacuum + fan + humidifier
    | 'update'      //update
    | 'input'       //input_number + counter + number
    | 'fallback';   //unknown domains

//Palette is intentionally narrow and harmonised for a near-black
//background. Hues were picked so neighbouring channels (e.g. light
/// climate, both warm) still feel distinct, while siblings of the
//same family (switch / system / trigger, all "discrete actions")
//land in the same green/teal/lime corner of the wheel.
export const CHANNEL_COLOR: Record<Channel, HexColor> =
{
    binary:    '#3B82F6',  //cobalt
    numeric:   '#EF4444',  //coral
    text:      '#A78BFA',  //lavender
    switch:    '#10B981',  //emerald
    light:     '#F59E0B',  //amber
    climate:   '#F97316',  //orange
    cover:     '#06B6D4',  //cyan
    lock:      '#F43F5E',  //rose
    media:     '#EC4899',  //pink
    presence:  '#8B5CF6',  //violet
    weather:   '#FACC15',  //gold
    system:    '#14B8A6',  //teal
    trigger:   '#A3E635',  //lime
    alarm:     '#DC2626',  //crimson
    appliance: '#0EA5E9',  //sky
    update:    '#D946EF',  //magenta
    input:     '#C084FC',  //pastel violet
    fallback:  '#94A3B8'   //slate
};

//Human-friendly channel label, surfaced in the legend.
export const CHANNEL_LABEL: Record<Channel, string> =
{
    binary:    'Binary',
    numeric:   'Numeric',
    text:      'Text',
    switch:    'Switch',
    light:     'Light',
    climate:   'Climate',
    cover:     'Cover',
    lock:      'Lock',
    media:     'Media',
    presence:  'Presence',
    weather:   'Weather',
    system:    'Automation',
    trigger:   'Trigger',
    alarm:     'Alarm',
    appliance: 'Appliance',
    update:    'Update',
    input:     'Input',
    fallback:  'Other'
};

//Domain → channel table. Anything missing falls into 'fallback' so
//unknown integrations still render (just in slate). This is the
//single source of truth for "which channel does this entity belong
//to" - both the renderer and the legend read from here.
const DOMAIN_CHANNEL: Record<string, Channel> =
{
    binary_sensor:       'binary',
    sensor:              'numeric',  //refined to 'text' at runtime when state is a non-numeric string
    switch:              'switch',
    input_boolean:       'switch',
    light:               'light',
    climate:             'climate',
    water_heater:        'climate',
    cover:               'cover',
    garage_door:         'cover',
    lock:                'lock',
    media_player:        'media',
    remote:              'media',
    person:              'presence',
    device_tracker:      'presence',
    zone:                'presence',
    weather:             'weather',
    sun:                 'weather',
    automation:          'system',
    script:              'system',
    scene:               'system',
    button:              'trigger',
    input_button:        'trigger',
    event:               'trigger',
    alarm_control_panel: 'alarm',
    siren:               'alarm',
    vacuum:              'appliance',
    fan:                 'appliance',
    humidifier:          'appliance',
    update:              'update',
    input_select:        'text',
    input_text:          'text',
    input_number:        'input',
    counter:             'input',
    number:              'input',
    timer:               'input'
};

//Extract the HA domain ("sensor", "binary_sensor", ...) from an
//entity id. Always returns a string; an entity id without a dot
//is uncommon but we return the input untouched so the caller can
//still see what it was.
export function domainOf(entityId: string): string
{
    const dot = entityId.indexOf('.');
    return dot === -1 ? entityId : entityId.slice(0, dot);
}

//Resolve the channel for an entity. State is consulted only to
//demote a numeric `sensor` to `text` when its state is not a
//number, which avoids painting strings like "home" in coral.
export function channelFor(entityId: string, state: string | null | undefined): Channel
{
    const domain = domainOf(entityId);
    const channel = DOMAIN_CHANNEL[domain] ?? 'fallback';

    if (channel === 'numeric' && !isNumeric(state))
    {
        return 'text';
    }

    return channel;
}

//Resolve the colour for an entity, in one call.
export function colorFor(entityId: string, state: string | null | undefined): HexColor
{
    return CHANNEL_COLOR[channelFor(entityId, state)];
}

//True when the string parses to a finite number. Booleans and
//empty strings fail this check, which is intended: "on", "off",
//"unavailable" should never end up on the numeric channel.
export function isNumeric(value: string | null | undefined): boolean
{
    if (value === null || value === undefined || value === '')
    {
        return false;
    }

    const n = Number(value);
    return Number.isFinite(n);
}

//Magnitude in [0..1] describing how "loud" a change is. Drives the
//ping radius so visually the screen reads like a heartbeat: small
//background flutters from steady sensors, occasional big ripples
//from a light turning on or a door opening.
export interface MagnitudeContext
{
    //Rolling mean of |delta| observed for this entity. Used to
    //scale numeric changes relative to their own history so a
    //temperature sensor and a power meter both look readable.
    deltaEma: number;
}

export function magnitudeFor(
    channel:  Channel,
    oldState: string | null | undefined,
    newState: string | null | undefined,
    ctx:      MagnitudeContext
): number
{
    //Toggle-style domains: encode the new state. ON is loud, OFF
    //is quiet. This is what the eye expects.
    if (channel === 'switch' || channel === 'light' || channel === 'binary' ||
        channel === 'lock' || channel === 'cover' || channel === 'alarm')
    {
        return isOnLike(newState) ? 0.85 : 0.4;
    }

    //Numeric: scale |delta| against its own rolling magnitude so
    //a 0.1 °C blip stays small even on a noisy sensor, while a
    //sudden jump still pops.
    if (channel === 'numeric' || channel === 'input')
    {
        const a = Number(oldState);
        const b = Number(newState);

        if (!Number.isFinite(a) || !Number.isFinite(b))
        {
            return 0.5;
        }

        const delta = Math.abs(b - a);

        if (ctx.deltaEma <= 0)
        {
            //First observation, or all-zero history: medium ping.
            return delta === 0 ? 0.35 : 0.6;
        }

        //Map ratio to a soft S-curve so extreme jumps cap out
        //instead of producing oversized spheres that overlap.
        const ratio = delta / (ctx.deltaEma * 2);
        return 0.35 + 0.55 * (1 - Math.exp(-ratio));
    }

    //Triggers, system actions, presence, weather, etc.: medium
    //ping. They do not carry an obvious magnitude.
    return 0.65;
}

//Recognise the "this thing is active" family of HA state strings.
//Centralised here so the renderer and the magnitude logic agree.
export function isOnLike(state: string | null | undefined): boolean
{
    if (!state)
    {
        return false;
    }

    switch (state.toLowerCase())
    {
        case 'on':
        case 'open':
        case 'unlocked':
        case 'home':
        case 'playing':
        case 'active':
        case 'cleaning':
        case 'heating':
        case 'cooling':
        case 'true':
            return true;
        default:
            return false;
    }
}

//Update a running mean used by magnitudeFor. Cheap EMA so the
//engine can call this on every state change without keeping a
//full history per entity.
export function updateDeltaEma(prev: number, sample: number, alpha = 0.15): number
{
    if (prev <= 0)
    {
        return sample;
    }

    return prev * (1 - alpha) + sample * alpha;
}

//Brighten a hex colour by a constant amount in HSL space. Used by
//the renderer for the hover/last-seen highlight without having to
//keep a second palette in sync.
export function brighten(hex: HexColor, amount = 0.12): HexColor
{
    const { h, s, l } = hexToHsl(hex);
    return hslToHex(h, s, clamp01(l + amount));
}

function clamp01(v: number): number
{
    return v < 0 ? 0 : v > 1 ? 1 : v;
}

function hexToHsl(hex: string): { h: number; s: number; l: number }
{
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    let h = 0;
    let s = 0;

    if (max !== min)
    {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max)
        {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return { h, s, l };
}

function hslToHex(h: number, s: number, l: number): HexColor
{
    let r: number;
    let g: number;
    let b: number;

    if (s === 0)
    {
        r = g = b = l;
    }
    else
    {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hueToRgb(p, q, h + 1 / 3);
        g = hueToRgb(p, q, h);
        b = hueToRgb(p, q, h - 1 / 3);
    }

    const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}` as HexColor;
}

function hueToRgb(p: number, q: number, t: number): number
{
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
}
