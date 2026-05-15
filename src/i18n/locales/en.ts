import type { Translation } from '../index';

export const en: Translation =
{
    cardName:            'Hermes',
    cardDescription:     'Real-time entity activity pulse',
    miniCardName:        'Hermes (mini)',
    miniCardDescription: 'Compact entity activity strip',

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

    editorAppearanceSection: 'Appearance',
    editorTimelineSection:   'Timelines',
    editorFilterSection:     'Entities',

    editorTitle:             'Title',
    editorCardTheme:         'Theme',
    editorThemeLight:        'Light',
    editorThemeDark:         'Dark',
    editorTimespan:          'Main window (s)',
    editorGlobalTimespan:    'Global strip window (s)',
    editorGlobalHeight:      'Global strip height (px)',
    editorShowGlobal:        'Show global strip',
    editorLabelWidth:        'Name column (px)',
    editorValueWidth:        'Value column (px)',
    editorShowLegend:        'Show legend',
    editorShowLastValue:     'Show last value',
    editorMaxPings:          'Max pings',
    editorEntities:          'Entities (one per line, supports * and ?)',
    editorEntitiesHint:      'Leave empty to track all entities in the allowed domains below.',
    editorIncludeDomains:    'Allowed domains (comma-separated)',
    editorExcludeEntities:   'Excluded entities (one per line)',
    editorExcludeDomains:    'Excluded domains (comma-separated)',
    editorIgnoreUnavailable: 'Ignore unavailable / unknown',

    yes: 'On',
    no:  'Off'
};
