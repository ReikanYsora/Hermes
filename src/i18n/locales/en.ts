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
    tooltipCount:    'Changes',
    justNow:         'just now',
    unitSec:         's ago',
    unitMin:         'min ago',
    unitHour:        'h ago',

    editorTitle:             'Title',
    editorTimespan:          'Main window (seconds)',
    editorGlobalTimespan:    'Global strip window (seconds)',
    editorGlobalHeight:      'Global strip height (px)',
    editorShowGlobal:        'Show global activity strip',
    editorLabelWidth:        'Name column width (px, 0 to hide)',
    editorValueWidth:        'Value column width (px)',
    editorShowLegend:        'Show legend',
    editorShowLastValue:     'Show last value next to name',
    editorMaxPings:          'Max retained pings',
    editorEntities:          'Entities (one per line, supports * and ?)',
    editorEntitiesHint:      'Leave empty to track all entities in the allowed domains below.',
    editorIncludeDomains:    'Allowed domains (comma-separated)',
    editorExcludeEntities:   'Excluded entities (one per line)',
    editorExcludeDomains:    'Excluded domains (comma-separated)',
    editorIgnoreUnavailable: 'Ignore unavailable / unknown blips'
};
