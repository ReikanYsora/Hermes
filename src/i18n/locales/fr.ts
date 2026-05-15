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
    tooltipCount:    'Changements',
    justNow:         "à l'instant",
    unitSec:         's',
    unitMin:         'min',
    unitHour:        'h',

    editorTitle:             'Titre',
    editorTimespan:          'Fenêtre principale (secondes)',
    editorGlobalTimespan:    'Fenêtre de la bande globale (secondes)',
    editorGlobalHeight:      'Hauteur de la bande globale (px)',
    editorShowGlobal:        "Afficher la bande d'activité globale",
    editorLabelWidth:        'Largeur de la colonne nom (px, 0 pour masquer)',
    editorValueWidth:        'Largeur de la colonne valeur (px)',
    editorShowLegend:        'Afficher la légende',
    editorShowLastValue:     'Afficher la dernière valeur près du nom',
    editorMaxPings:          'Pings retenus (max)',
    editorEntities:          'Entités (une par ligne, * et ? acceptés)',
    editorEntitiesHint:      'Laissez vide pour suivre toutes les entités des domaines autorisés ci-dessous.',
    editorIncludeDomains:    'Domaines autorisés (séparés par des virgules)',
    editorExcludeEntities:   'Entités exclues (une par ligne)',
    editorExcludeDomains:    'Domaines exclus (séparés par des virgules)',
    editorIgnoreUnavailable: 'Ignorer les passages indisponible / inconnu'
};
