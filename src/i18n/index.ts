/*
 * Tiny i18n table.
 *
 * Two languages out of the box (English + French). The card picks
 * a translation table once per render based on the host language
 * (HA's `hass.language` falls back to navigator.language at boot
 * before hass is wired in). Anything not translated falls back to
 * English; the resolver does that automatically by reading from
 * the English object first.
 */

import { de } from './locales/de';
import { en } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { it } from './locales/it';
import { nl } from './locales/nl';
import { pt } from './locales/pt';

export interface Translation
{
    cardName:            string;
    cardDescription:     string;
    miniCardName:        string;
    miniCardDescription: string;
    entity:              string;
    entities:            string;
    emptyTitle:          string;
    emptyHint:           string;
    tooltipValue:        string;
    tooltipPrevious:     string;
    tooltipAgo:          string;
    tooltipCount:        string;
    justNow:             string;
    unitSec:             string;
    unitMin:             string;
    unitHour:            string;

    //Editor-only strings; lazy-evaluated so a card with no editor
    //in view still pays nothing for them.
    editorAppearanceSection: string;
    editorTimelineSection:   string;
    editorFilterSection:     string;

    editorTitle:             string;
    editorCardTheme:         string;
    editorThemeLight:        string;
    editorThemeDark:         string;
    editorTimespan:          string;
    editorGlobalTimespan:    string;
    editorGlobalHeight:      string;
    editorShowGlobal:        string;
    editorLabelWidth:        string;
    editorValueWidth:        string;
    editorShowLegend:        string;
    editorShowLastValue:     string;
    editorMaxPings:          string;
    editorEntities:          string;
    editorEntitiesHint:      string;
    editorIncludeDomains:    string;
    editorExcludeEntities:   string;
    editorExcludeDomains:    string;
    editorIgnoreUnavailable: string;

    yes:                 string;
    no:                  string;

    actionPlay:          string;
    actionPause:         string;
}

const TABLE: Record<string, Translation> =
{
    de,
    en,
    es,
    fr,
    it,
    nl,
    pt
};

export function pickTranslations(language: string | undefined | null): Translation
{
    if (!language) return en;
    const tag = language.toLowerCase();
    //Try exact match first ("fr-fr"), then primary subtag ("fr").
    if (TABLE[tag]) return TABLE[tag];
    const primary = tag.split('-')[0];
    if (TABLE[primary]) return TABLE[primary];
    return en;
}
