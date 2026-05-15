import type { Translation } from '../index';

export const en: Translation =
{
    cardName:        'Hermes',
    cardDescription: 'Real-time entity activity pulse',
    entity:          'entity',
    entities:        'entities',
    emptyTitle:      'Listening…',
    emptyHint:       'A sphere will appear for every entity state change.',
    tooltipValue:    'Value',
    tooltipPrevious: 'Previous',
    tooltipAgo:      'Seen',
    justNow:         'just now',
    unitSec:         's ago',
    unitMin:         'min ago',
    unitHour:        'h ago',

    editorTitle:           'Title',
    editorTimespan:        'Visible window (seconds)',
    editorHeight:          'Card height (px)',
    editorLabelWidth:      'Label gutter (px, 0 to hide)',
    editorShowLegend:      'Show legend',
    editorShowLastValue:   'Show last value next to label',
    editorMaxPings:        'Max retained pings',
    editorEntities:        'Entities (one per line, supports * and ?)',
    editorEntitiesHint:    'Leave empty to track all entities in the allowed domains below.',
    editorIncludeDomains:  'Allowed domains (comma-separated)',
    editorExcludeEntities: 'Excluded entities (one per line)',
    editorExcludeDomains:  'Excluded domains (comma-separated)',
    editorIgnoreUnavailable: 'Ignore unavailable / unknown blips'
};
