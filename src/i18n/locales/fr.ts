import type { Translation } from '../index';

export const fr: Translation =
{
    cardName:        'Hermes',
    cardDescription: "Pouls d'activité des entités en temps réel",
    entity:          'entité',
    entities:        'entités',
    emptyTitle:      'À l\'écoute…',
    emptyHint:       'Une sphère apparaîtra pour chaque changement d\'état d\'entité.',
    tooltipValue:    'Valeur',
    tooltipPrevious: 'Précédente',
    tooltipAgo:      'Vu',
    justNow:         "à l'instant",
    unitSec:         's',
    unitMin:         'min',
    unitHour:        'h',

    editorTitle:           'Titre',
    editorTimespan:        'Fenêtre visible (secondes)',
    editorHeight:          'Hauteur de la carte (px)',
    editorLabelWidth:      'Marge des libellés (px, 0 pour masquer)',
    editorShowLegend:      'Afficher la légende',
    editorShowLastValue:   'Afficher la dernière valeur près du libellé',
    editorMaxPings:        'Pings retenus (max)',
    editorEntities:        'Entités (une par ligne, * et ? acceptés)',
    editorEntitiesHint:    'Laissez vide pour suivre toutes les entités des domaines autorisés ci-dessous.',
    editorIncludeDomains:  'Domaines autorisés (séparés par des virgules)',
    editorExcludeEntities: 'Entités exclues (une par ligne)',
    editorExcludeDomains:  'Domaines exclus (séparés par des virgules)',
    editorIgnoreUnavailable: 'Ignorer les passages indisponible / inconnu'
};
