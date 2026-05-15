/*
 * Hermes visual editor.
 *
 * Single-column Helios-style layout: each control is a `.field`
 * row with the label on the left and the input / toggle on the
 * right (180 px budget). Section titles in the primary HA colour
 * group the rows. Returned by HermesCard.getConfigElement() and
 * shared by both the full and mini variants — the mini-only
 * card hides the per-entity stage fields below the global strip
 * fields.
 *
 * We dispatch the standard `config-changed` CustomEvent on every
 * input mutation so HA picks the new state up in the live preview.
 */

import { LitElement, html, css, TemplateResult, nothing } from 'lit';
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
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            font-family:
                ui-sans-serif, system-ui, -apple-system, "Segoe UI",
                "Inter", "Helvetica Neue", Arial, sans-serif;
        }

        .section-title
        {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: var(--primary-color, #8b5cf6);
            margin-top: 10px;
            padding-bottom: 4px;
            border-bottom: 1px solid var(--divider-color, rgba(0,0,0,0.12));
        }

        .hint
        {
            font-size: 11px;
            color: var(--secondary-text-color, #727272);
            font-style: italic;
        }

        .field
        {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            position: relative;
        }

        .field.field-block
        {
            flex-direction: column;
            align-items: stretch;
            gap: 4px;
        }

        .field.field-block > .label
        {
            flex: none;
        }

        .label
        {
            font-size: 13px;
            color: var(--primary-text-color, #212121);
            flex: 1;
        }

        input[type="text"],
        input[type="number"]
        {
            width: 180px;
            padding: 6px 8px;
            border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
            border-radius: 4px;
            background: var(--card-background-color, #fff);
            color: var(--primary-text-color, #212121);
            font-size: 13px;
            font-family: inherit;
        }

        textarea
        {
            width: 100%;
            min-height: 80px;
            box-sizing: border-box;
            padding: 6px 8px;
            border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
            border-radius: 4px;
            background: var(--card-background-color, #fff);
            color: var(--primary-text-color, #212121);
            font-size: 12px;
            font-family:
                ui-monospace, SFMono-Regular, "SF Mono", Menlo,
                Consolas, monospace;
            resize: vertical;
        }

        /*  Two-button toggle, sized to match the other inputs so
            the right-edge alignment stays consistent. */
        .segmented-toggle
        {
            display: inline-flex;
            width: 180px;
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
            background: var(--card-background-color, #fff);
        }

        .seg-option
        {
            flex: 1;
            padding: 7px 10px;
            background: transparent;
            color: var(--primary-text-color, #212121);
            border: none;
            cursor: pointer;
            font-size: 13px;
            font-family: inherit;
            transition: background 0.15s, color 0.15s;
        }

        .seg-option + .seg-option
        {
            border-left: 1px solid var(--divider-color, rgba(0,0,0,0.12));
        }

        .seg-option:hover:not(.active)
        {
            background: var(--secondary-background-color, rgba(0,0,0,0.04));
        }

        .seg-option.active
        {
            background: var(--primary-color, #8b5cf6);
            color: var(--text-primary-color, #fff);
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
        const type = config?.type === 'custom:hermes-mini-card'
            ? 'custom:hermes-mini-card'
            : 'custom:hermes-card';
        this._config = { ...config, type };
    }

    private get _isMini(): boolean
    {
        return this._config.type === 'custom:hermes-mini-card';
    }

    override render(): TemplateResult
    {
        const c = this._config;
        const i = this._i18n;
        const mini = this._isMini;

        const domainsCsv = (c.include_domains ?? [...DEFAULT_INCLUDE_DOMAINS]).join(', ');
        const excludeDomainsCsv = (c.exclude_domains ?? []).join(', ');
        const entitiesText = (c.entities ?? []).join('\n');
        const excludeEntitiesText = (c.exclude_entities ?? []).join('\n');

        return html`
            <div class="editor">
                <div class="section-title">${i.editorAppearanceSection}</div>

                <div class="field">
                    <span class="label">${i.editorTitle}</span>
                    <input
                        type="text"
                        .value=${c.title ?? 'Activity'}
                        @input=${(e: Event) => this._update('title', (e.target as HTMLInputElement).value)}
                    />
                </div>

                <div class="field">
                    <span class="label">${i.editorCardTheme}</span>
                    <div class="segmented-toggle">
                        <button
                            type="button"
                            class="seg-option ${(c.card_theme ?? 'dark') === 'light' ? 'active' : ''}"
                            @click=${() => this._update('card_theme', 'light')}
                        >${i.editorThemeLight}</button>
                        <button
                            type="button"
                            class="seg-option ${(c.card_theme ?? 'dark') === 'dark' ? 'active' : ''}"
                            @click=${() => this._update('card_theme', 'dark')}
                        >${i.editorThemeDark}</button>
                    </div>
                </div>

                ${this._segmentedToggle(i.editorShowLegend, 'show_legend', c.show_legend !== false)}

                <div class="section-title">${i.editorTimelineSection}</div>

                <div class="field">
                    <span class="label">${i.editorGlobalTimespan}</span>
                    <input
                        type="number"
                        min="5"
                        max="3600"
                        step="5"
                        .value=${String(c.global_timespan_seconds ?? (mini ? 30 : 60))}
                        @input=${(e: Event) => this._updateNum('global_timespan_seconds', (e.target as HTMLInputElement).value)}
                    />
                </div>

                ${mini ? nothing : html`
                    <div class="field">
                        <span class="label">${i.editorGlobalHeight}</span>
                        <input
                            type="number"
                            min="32"
                            max="200"
                            step="4"
                            .value=${String(c.global_height ?? 72)}
                            @input=${(e: Event) => this._updateNum('global_height', (e.target as HTMLInputElement).value)}
                        />
                    </div>

                    ${this._segmentedToggle(i.editorShowGlobal, 'show_global', c.show_global !== false)}

                    <div class="field">
                        <span class="label">${i.editorTimespan}</span>
                        <input
                            type="number"
                            min="10"
                            max="86400"
                            step="10"
                            .value=${String(c.timespan_seconds ?? 300)}
                            @input=${(e: Event) => this._updateNum('timespan_seconds', (e.target as HTMLInputElement).value)}
                        />
                    </div>

                    <div class="field">
                        <span class="label">${i.editorLabelWidth}</span>
                        <input
                            type="number"
                            min="0"
                            max="320"
                            step="4"
                            .value=${String(c.label_width ?? 150)}
                            @input=${(e: Event) => this._updateNum('label_width', (e.target as HTMLInputElement).value)}
                        />
                    </div>

                    <div class="field">
                        <span class="label">${i.editorValueWidth}</span>
                        <input
                            type="number"
                            min="0"
                            max="200"
                            step="4"
                            .value=${String(c.value_width ?? 64)}
                            @input=${(e: Event) => this._updateNum('value_width', (e.target as HTMLInputElement).value)}
                        />
                    </div>

                    ${this._segmentedToggle(i.editorShowLastValue, 'show_last_value', c.show_last_value !== false)}
                `}

                <div class="section-title">${i.editorFilterSection}</div>

                <div class="field field-block">
                    <span class="label">${i.editorEntities}</span>
                    <textarea
                        spellcheck="false"
                        @input=${(e: Event) => this._updateList('entities', (e.target as HTMLTextAreaElement).value, '\n')}
                    >${entitiesText}</textarea>
                    <div class="hint">${i.editorEntitiesHint}</div>
                </div>

                <div class="field field-block">
                    <span class="label">${i.editorIncludeDomains}</span>
                    <input
                        type="text"
                        style="width: 100%; box-sizing: border-box;"
                        .value=${domainsCsv}
                        @input=${(e: Event) => this._updateList('include_domains', (e.target as HTMLInputElement).value, ',')}
                    />
                </div>

                <div class="field field-block">
                    <span class="label">${i.editorExcludeEntities}</span>
                    <textarea
                        spellcheck="false"
                        @input=${(e: Event) => this._updateList('exclude_entities', (e.target as HTMLTextAreaElement).value, '\n')}
                    >${excludeEntitiesText}</textarea>
                </div>

                <div class="field field-block">
                    <span class="label">${i.editorExcludeDomains}</span>
                    <input
                        type="text"
                        style="width: 100%; box-sizing: border-box;"
                        .value=${excludeDomainsCsv}
                        @input=${(e: Event) => this._updateList('exclude_domains', (e.target as HTMLInputElement).value, ',')}
                    />
                </div>

                ${this._segmentedToggle(i.editorIgnoreUnavailable, 'ignore_unavailable', c.ignore_unavailable !== false)}

                <div class="field">
                    <span class="label">${i.editorMaxPings}</span>
                    <input
                        type="number"
                        min="50"
                        max="20000"
                        step="50"
                        .value=${String(c.max_pings ?? 2000)}
                        @input=${(e: Event) => this._updateNum('max_pings', (e.target as HTMLInputElement).value)}
                    />
                </div>
            </div>
        `;
    }

    private _segmentedToggle(label: string, key: keyof HermesCardConfig, current: boolean): TemplateResult
    {
        const i = this._i18n;
        return html`
            <div class="field">
                <span class="label">${label}</span>
                <div class="segmented-toggle">
                    <button
                        type="button"
                        class="seg-option ${current ? 'active' : ''}"
                        @click=${() => this._update(key, true as never)}
                    >${i.yes}</button>
                    <button
                        type="button"
                        class="seg-option ${!current ? 'active' : ''}"
                        @click=${() => this._update(key, false as never)}
                    >${i.no}</button>
                </div>
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
