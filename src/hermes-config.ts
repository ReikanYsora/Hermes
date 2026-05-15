/*
 * Hermes visual editor.
 *
 * A small Lit element registered as <hermes-card-editor>, returned
 * to Home Assistant by HermesCard.getConfigElement(). HA's
 * dashboard wires it to the live YAML by setting `.hass` and
 * `.setConfig(cfg)` on us, then listens for the standard
 * `config-changed` CustomEvent we dispatch on every input change.
 *
 * The editor is intentionally barebones (no ha-form, no entity
 * pickers) so the bundle stays small and so it works on any HA
 * version without depending on internal frontend APIs that move
 * between releases.
 */

import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HermesCardConfig } from './hermes-card';
import { pickTranslations, type Translation } from './i18n';
import { DEFAULT_INCLUDE_DOMAINS } from './hermes-engine';

@customElement('hermes-card-editor')
export class HermesCardEditor extends LitElement
{
    static override styles = css`
        :host
        {
            display: block;
        }

        .editor
        {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px 16px;
            padding: 12px 0;
            font-family:
                ui-sans-serif, system-ui, -apple-system, "Segoe UI",
                "Inter", "Helvetica Neue", Arial, sans-serif;
        }

        .row
        {
            display: flex;
            flex-direction: column;
            gap: 4px;
            min-width: 0;
        }

        .row.wide
        {
            grid-column: 1 / -1;
        }

        .row > label
        {
            font-size: 12px;
            color: var(--secondary-text-color, #aaa);
        }

        .row input[type="text"],
        .row input[type="number"],
        .row textarea
        {
            background: var(--card-background-color, #1c1f24);
            color: var(--primary-text-color, #eee);
            border: 1px solid var(--divider-color, #333);
            border-radius: 8px;
            padding: 8px 10px;
            font: inherit;
            outline: none;
        }

        .row input:focus,
        .row textarea:focus
        {
            border-color: var(--primary-color, #8b5cf6);
        }

        .row textarea
        {
            min-height: 84px;
            resize: vertical;
            font-family:
                ui-monospace, SFMono-Regular, "SF Mono", Menlo,
                Consolas, monospace;
            font-size: 12px;
        }

        .row.toggle
        {
            flex-direction: row;
            align-items: center;
            gap: 8px;
        }

        .row.toggle > label
        {
            order: 2;
            font-size: 13px;
            color: var(--primary-text-color, #eee);
        }

        .hint
        {
            font-size: 11px;
            color: var(--secondary-text-color, #aaa);
            line-height: 1.4;
        }
    `;

    @property({ attribute: false }) hass?: unknown;

    @state() private _config: HermesCardConfig = { type: 'custom:hermes-card' };
    @state() private _i18n: Translation = pickTranslations(
        typeof navigator !== 'undefined' ? navigator.language : 'en'
    );

    setConfig(config: HermesCardConfig): void
    {
        //Defensive copy so HA's reactive system doesn't see our
        //in-progress mutations before we dispatch.
        this._config = { ...config, type: 'custom:hermes-card' };
    }

    override render(): TemplateResult
    {
        const c = this._config;
        const i = this._i18n;

        const domainsCsv = (c.include_domains ?? [...DEFAULT_INCLUDE_DOMAINS]).join(', ');
        const excludeDomainsCsv = (c.exclude_domains ?? []).join(', ');
        const entitiesText = (c.entities ?? []).join('\n');
        const excludeEntitiesText = (c.exclude_entities ?? []).join('\n');

        return html`
            <div class="editor">
                <div class="row">
                    <label>${i.editorTitle}</label>
                    <input
                        type="text"
                        .value=${c.title ?? 'Activity'}
                        @input=${(e: Event) => this._update('title', (e.target as HTMLInputElement).value)}
                    />
                </div>

                <div class="row">
                    <label>${i.editorTimespan}</label>
                    <input
                        type="number"
                        min="10"
                        max="86400"
                        step="10"
                        .value=${String(c.timespan_seconds ?? 300)}
                        @input=${(e: Event) => this._updateNum('timespan_seconds', (e.target as HTMLInputElement).value)}
                    />
                </div>

                <div class="row">
                    <label>${i.editorHeight}</label>
                    <input
                        type="number"
                        min="140"
                        max="1200"
                        step="10"
                        .value=${String(c.height ?? 320)}
                        @input=${(e: Event) => this._updateNum('height', (e.target as HTMLInputElement).value)}
                    />
                </div>

                <div class="row">
                    <label>${i.editorLabelWidth}</label>
                    <input
                        type="number"
                        min="0"
                        max="320"
                        step="4"
                        .value=${String(c.label_width ?? 168)}
                        @input=${(e: Event) => this._updateNum('label_width', (e.target as HTMLInputElement).value)}
                    />
                </div>

                <div class="row">
                    <label>${i.editorMaxPings}</label>
                    <input
                        type="number"
                        min="50"
                        max="20000"
                        step="50"
                        .value=${String(c.max_pings ?? 2000)}
                        @input=${(e: Event) => this._updateNum('max_pings', (e.target as HTMLInputElement).value)}
                    />
                </div>

                ${this._toggleRow(i.editorShowLegend,        'show_legend',         c.show_legend         !== false)}
                ${this._toggleRow(i.editorShowLastValue,     'show_last_value',     c.show_last_value     !== false)}
                ${this._toggleRow(i.editorIgnoreUnavailable, 'ignore_unavailable',  c.ignore_unavailable  !== false)}

                <div class="row wide">
                    <label>${i.editorEntities}</label>
                    <textarea
                        spellcheck="false"
                        @input=${(e: Event) => this._updateList('entities', (e.target as HTMLTextAreaElement).value, '\n')}
                    >${entitiesText}</textarea>
                    <div class="hint">${i.editorEntitiesHint}</div>
                </div>

                <div class="row wide">
                    <label>${i.editorIncludeDomains}</label>
                    <input
                        type="text"
                        .value=${domainsCsv}
                        @input=${(e: Event) => this._updateList('include_domains', (e.target as HTMLInputElement).value, ',')}
                    />
                </div>

                <div class="row">
                    <label>${i.editorExcludeEntities}</label>
                    <textarea
                        spellcheck="false"
                        @input=${(e: Event) => this._updateList('exclude_entities', (e.target as HTMLTextAreaElement).value, '\n')}
                    >${excludeEntitiesText}</textarea>
                </div>

                <div class="row">
                    <label>${i.editorExcludeDomains}</label>
                    <input
                        type="text"
                        .value=${excludeDomainsCsv}
                        @input=${(e: Event) => this._updateList('exclude_domains', (e.target as HTMLInputElement).value, ',')}
                    />
                </div>
            </div>
        `;
    }

    private _toggleRow(label: string, key: keyof HermesCardConfig, current: boolean): TemplateResult
    {
        const id = `tgl-${String(key)}`;
        return html`
            <div class="row toggle">
                <input
                    id=${id}
                    type="checkbox"
                    .checked=${current}
                    @change=${(e: Event) => this._update(key, (e.target as HTMLInputElement).checked as never)}
                />
                <label for=${id}>${label}</label>
            </div>
        `;
    }

    private _update<K extends keyof HermesCardConfig>(key: K, value: HermesCardConfig[K]): void
    {
        const next: HermesCardConfig = { ...this._config, [key]: value };
        if (value === '' || value === undefined || value === null)
        {
            delete next[key];
        }
        this._config = next;
        this._dispatch();
    }

    private _updateNum(key: keyof HermesCardConfig, raw: string): void
    {
        const n = Number(raw);
        if (!Number.isFinite(n))
        {
            return;
        }
        this._update(key, n as never);
    }

    private _updateList(key: keyof HermesCardConfig, raw: string, sep: string): void
    {
        const list = raw
            .split(sep)
            .map(s => s.trim())
            .filter(s => s.length > 0);

        if (list.length === 0)
        {
            const next = { ...this._config };
            delete next[key];
            this._config = next;
            this._dispatch();
            return;
        }

        this._update(key, list as never);
    }

    private _dispatch(): void
    {
        this.dispatchEvent(new CustomEvent('config-changed', {
            detail:   { config: this._config },
            bubbles:  true,
            composed: true
        }));
    }
}
