/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2 = globalThis, e$2 = t$2.ShadowRoot && (void 0 === t$2.ShadyCSS || t$2.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, s$2 = Symbol(), o$4 = /* @__PURE__ */ new WeakMap();
let n$3 = class n {
  constructor(t2, e2, o2) {
    if (this._$cssResult$ = true, o2 !== s$2) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t2, this.t = e2;
  }
  get styleSheet() {
    let t2 = this.o;
    const s2 = this.t;
    if (e$2 && void 0 === t2) {
      const e2 = void 0 !== s2 && 1 === s2.length;
      e2 && (t2 = o$4.get(s2)), void 0 === t2 && ((this.o = t2 = new CSSStyleSheet()).replaceSync(this.cssText), e2 && o$4.set(s2, t2));
    }
    return t2;
  }
  toString() {
    return this.cssText;
  }
};
const r$4 = (t2) => new n$3("string" == typeof t2 ? t2 : t2 + "", void 0, s$2), i$3 = (t2, ...e2) => {
  const o2 = 1 === t2.length ? t2[0] : e2.reduce((e3, s2, o3) => e3 + ((t3) => {
    if (true === t3._$cssResult$) return t3.cssText;
    if ("number" == typeof t3) return t3;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t3 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s2) + t2[o3 + 1], t2[0]);
  return new n$3(o2, t2, s$2);
}, S$1 = (s2, o2) => {
  if (e$2) s2.adoptedStyleSheets = o2.map((t2) => t2 instanceof CSSStyleSheet ? t2 : t2.styleSheet);
  else for (const e2 of o2) {
    const o3 = document.createElement("style"), n3 = t$2.litNonce;
    void 0 !== n3 && o3.setAttribute("nonce", n3), o3.textContent = e2.cssText, s2.appendChild(o3);
  }
}, c$2 = e$2 ? (t2) => t2 : (t2) => t2 instanceof CSSStyleSheet ? ((t3) => {
  let e2 = "";
  for (const s2 of t3.cssRules) e2 += s2.cssText;
  return r$4(e2);
})(t2) : t2;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: i$2, defineProperty: e$1, getOwnPropertyDescriptor: h$1, getOwnPropertyNames: r$3, getOwnPropertySymbols: o$3, getPrototypeOf: n$2 } = Object, a$1 = globalThis, c$1 = a$1.trustedTypes, l$1 = c$1 ? c$1.emptyScript : "", p$1 = a$1.reactiveElementPolyfillSupport, d$1 = (t2, s2) => t2, u$1 = { toAttribute(t2, s2) {
  switch (s2) {
    case Boolean:
      t2 = t2 ? l$1 : null;
      break;
    case Object:
    case Array:
      t2 = null == t2 ? t2 : JSON.stringify(t2);
  }
  return t2;
}, fromAttribute(t2, s2) {
  let i2 = t2;
  switch (s2) {
    case Boolean:
      i2 = null !== t2;
      break;
    case Number:
      i2 = null === t2 ? null : Number(t2);
      break;
    case Object:
    case Array:
      try {
        i2 = JSON.parse(t2);
      } catch (t3) {
        i2 = null;
      }
  }
  return i2;
} }, f$1 = (t2, s2) => !i$2(t2, s2), b$1 = { attribute: true, type: String, converter: u$1, reflect: false, useDefault: false, hasChanged: f$1 };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), a$1.litPropertyMetadata ?? (a$1.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let y$1 = class y extends HTMLElement {
  static addInitializer(t2) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t2);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t2, s2 = b$1) {
    if (s2.state && (s2.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t2) && ((s2 = Object.create(s2)).wrapped = true), this.elementProperties.set(t2, s2), !s2.noAccessor) {
      const i2 = Symbol(), h2 = this.getPropertyDescriptor(t2, i2, s2);
      void 0 !== h2 && e$1(this.prototype, t2, h2);
    }
  }
  static getPropertyDescriptor(t2, s2, i2) {
    const { get: e2, set: r2 } = h$1(this.prototype, t2) ?? { get() {
      return this[s2];
    }, set(t3) {
      this[s2] = t3;
    } };
    return { get: e2, set(s3) {
      const h2 = e2?.call(this);
      r2?.call(this, s3), this.requestUpdate(t2, h2, i2);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t2) {
    return this.elementProperties.get(t2) ?? b$1;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d$1("elementProperties"))) return;
    const t2 = n$2(this);
    t2.finalize(), void 0 !== t2.l && (this.l = [...t2.l]), this.elementProperties = new Map(t2.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d$1("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d$1("properties"))) {
      const t3 = this.properties, s2 = [...r$3(t3), ...o$3(t3)];
      for (const i2 of s2) this.createProperty(i2, t3[i2]);
    }
    const t2 = this[Symbol.metadata];
    if (null !== t2) {
      const s2 = litPropertyMetadata.get(t2);
      if (void 0 !== s2) for (const [t3, i2] of s2) this.elementProperties.set(t3, i2);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t3, s2] of this.elementProperties) {
      const i2 = this._$Eu(t3, s2);
      void 0 !== i2 && this._$Eh.set(i2, t3);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s2) {
    const i2 = [];
    if (Array.isArray(s2)) {
      const e2 = new Set(s2.flat(1 / 0).reverse());
      for (const s3 of e2) i2.unshift(c$2(s3));
    } else void 0 !== s2 && i2.push(c$2(s2));
    return i2;
  }
  static _$Eu(t2, s2) {
    const i2 = s2.attribute;
    return false === i2 ? void 0 : "string" == typeof i2 ? i2 : "string" == typeof t2 ? t2.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t2) => this.enableUpdating = t2), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t2) => t2(this));
  }
  addController(t2) {
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t2), void 0 !== this.renderRoot && this.isConnected && t2.hostConnected?.();
  }
  removeController(t2) {
    this._$EO?.delete(t2);
  }
  _$E_() {
    const t2 = /* @__PURE__ */ new Map(), s2 = this.constructor.elementProperties;
    for (const i2 of s2.keys()) this.hasOwnProperty(i2) && (t2.set(i2, this[i2]), delete this[i2]);
    t2.size > 0 && (this._$Ep = t2);
  }
  createRenderRoot() {
    const t2 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S$1(t2, this.constructor.elementStyles), t2;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), this._$EO?.forEach((t2) => t2.hostConnected?.());
  }
  enableUpdating(t2) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t2) => t2.hostDisconnected?.());
  }
  attributeChangedCallback(t2, s2, i2) {
    this._$AK(t2, i2);
  }
  _$ET(t2, s2) {
    const i2 = this.constructor.elementProperties.get(t2), e2 = this.constructor._$Eu(t2, i2);
    if (void 0 !== e2 && true === i2.reflect) {
      const h2 = (void 0 !== i2.converter?.toAttribute ? i2.converter : u$1).toAttribute(s2, i2.type);
      this._$Em = t2, null == h2 ? this.removeAttribute(e2) : this.setAttribute(e2, h2), this._$Em = null;
    }
  }
  _$AK(t2, s2) {
    const i2 = this.constructor, e2 = i2._$Eh.get(t2);
    if (void 0 !== e2 && this._$Em !== e2) {
      const t3 = i2.getPropertyOptions(e2), h2 = "function" == typeof t3.converter ? { fromAttribute: t3.converter } : void 0 !== t3.converter?.fromAttribute ? t3.converter : u$1;
      this._$Em = e2;
      const r2 = h2.fromAttribute(s2, t3.type);
      this[e2] = r2 ?? this._$Ej?.get(e2) ?? r2, this._$Em = null;
    }
  }
  requestUpdate(t2, s2, i2, e2 = false, h2) {
    if (void 0 !== t2) {
      const r2 = this.constructor;
      if (false === e2 && (h2 = this[t2]), i2 ?? (i2 = r2.getPropertyOptions(t2)), !((i2.hasChanged ?? f$1)(h2, s2) || i2.useDefault && i2.reflect && h2 === this._$Ej?.get(t2) && !this.hasAttribute(r2._$Eu(t2, i2)))) return;
      this.C(t2, s2, i2);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t2, s2, { useDefault: i2, reflect: e2, wrapped: h2 }, r2) {
    i2 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t2) && (this._$Ej.set(t2, r2 ?? s2 ?? this[t2]), true !== h2 || void 0 !== r2) || (this._$AL.has(t2) || (this.hasUpdated || i2 || (s2 = void 0), this._$AL.set(t2, s2)), true === e2 && this._$Em !== t2 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t2));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t3) {
      Promise.reject(t3);
    }
    const t2 = this.scheduleUpdate();
    return null != t2 && await t2, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [t4, s3] of this._$Ep) this[t4] = s3;
        this._$Ep = void 0;
      }
      const t3 = this.constructor.elementProperties;
      if (t3.size > 0) for (const [s3, i2] of t3) {
        const { wrapped: t4 } = i2, e2 = this[s3];
        true !== t4 || this._$AL.has(s3) || void 0 === e2 || this.C(s3, void 0, i2, e2);
      }
    }
    let t2 = false;
    const s2 = this._$AL;
    try {
      t2 = this.shouldUpdate(s2), t2 ? (this.willUpdate(s2), this._$EO?.forEach((t3) => t3.hostUpdate?.()), this.update(s2)) : this._$EM();
    } catch (s3) {
      throw t2 = false, this._$EM(), s3;
    }
    t2 && this._$AE(s2);
  }
  willUpdate(t2) {
  }
  _$AE(t2) {
    this._$EO?.forEach((t3) => t3.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t2)), this.updated(t2);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t2) {
    return true;
  }
  update(t2) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t3) => this._$ET(t3, this[t3]))), this._$EM();
  }
  updated(t2) {
  }
  firstUpdated(t2) {
  }
};
y$1.elementStyles = [], y$1.shadowRootOptions = { mode: "open" }, y$1[d$1("elementProperties")] = /* @__PURE__ */ new Map(), y$1[d$1("finalized")] = /* @__PURE__ */ new Map(), p$1?.({ ReactiveElement: y$1 }), (a$1.reactiveElementVersions ?? (a$1.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1 = globalThis, i$1 = (t2) => t2, s$1 = t$1.trustedTypes, e = s$1 ? s$1.createPolicy("lit-html", { createHTML: (t2) => t2 }) : void 0, h = "$lit$", o$2 = `lit$${Math.random().toFixed(9).slice(2)}$`, n$1 = "?" + o$2, r$2 = `<${n$1}>`, l = document, c = () => l.createComment(""), a = (t2) => null === t2 || "object" != typeof t2 && "function" != typeof t2, u = Array.isArray, d = (t2) => u(t2) || "function" == typeof t2?.[Symbol.iterator], f = "[ 	\n\f\r]", v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, _ = /-->/g, m = />/g, p = RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), g = /'/g, $ = /"/g, y2 = /^(?:script|style|textarea|title)$/i, x = (t2) => (i2, ...s2) => ({ _$litType$: t2, strings: i2, values: s2 }), b = x(1), E = Symbol.for("lit-noChange"), A = Symbol.for("lit-nothing"), C = /* @__PURE__ */ new WeakMap(), P = l.createTreeWalker(l, 129);
function V(t2, i2) {
  if (!u(t2) || !t2.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e ? e.createHTML(i2) : i2;
}
const N = (t2, i2) => {
  const s2 = t2.length - 1, e2 = [];
  let n3, l2 = 2 === i2 ? "<svg>" : 3 === i2 ? "<math>" : "", c2 = v;
  for (let i3 = 0; i3 < s2; i3++) {
    const s3 = t2[i3];
    let a2, u2, d2 = -1, f2 = 0;
    for (; f2 < s3.length && (c2.lastIndex = f2, u2 = c2.exec(s3), null !== u2); ) f2 = c2.lastIndex, c2 === v ? "!--" === u2[1] ? c2 = _ : void 0 !== u2[1] ? c2 = m : void 0 !== u2[2] ? (y2.test(u2[2]) && (n3 = RegExp("</" + u2[2], "g")), c2 = p) : void 0 !== u2[3] && (c2 = p) : c2 === p ? ">" === u2[0] ? (c2 = n3 ?? v, d2 = -1) : void 0 === u2[1] ? d2 = -2 : (d2 = c2.lastIndex - u2[2].length, a2 = u2[1], c2 = void 0 === u2[3] ? p : '"' === u2[3] ? $ : g) : c2 === $ || c2 === g ? c2 = p : c2 === _ || c2 === m ? c2 = v : (c2 = p, n3 = void 0);
    const x2 = c2 === p && t2[i3 + 1].startsWith("/>") ? " " : "";
    l2 += c2 === v ? s3 + r$2 : d2 >= 0 ? (e2.push(a2), s3.slice(0, d2) + h + s3.slice(d2) + o$2 + x2) : s3 + o$2 + (-2 === d2 ? i3 : x2);
  }
  return [V(t2, l2 + (t2[s2] || "<?>") + (2 === i2 ? "</svg>" : 3 === i2 ? "</math>" : "")), e2];
};
class S {
  constructor({ strings: t2, _$litType$: i2 }, e2) {
    let r2;
    this.parts = [];
    let l2 = 0, a2 = 0;
    const u2 = t2.length - 1, d2 = this.parts, [f2, v2] = N(t2, i2);
    if (this.el = S.createElement(f2, e2), P.currentNode = this.el.content, 2 === i2 || 3 === i2) {
      const t3 = this.el.content.firstChild;
      t3.replaceWith(...t3.childNodes);
    }
    for (; null !== (r2 = P.nextNode()) && d2.length < u2; ) {
      if (1 === r2.nodeType) {
        if (r2.hasAttributes()) for (const t3 of r2.getAttributeNames()) if (t3.endsWith(h)) {
          const i3 = v2[a2++], s2 = r2.getAttribute(t3).split(o$2), e3 = /([.?@])?(.*)/.exec(i3);
          d2.push({ type: 1, index: l2, name: e3[2], strings: s2, ctor: "." === e3[1] ? I : "?" === e3[1] ? L : "@" === e3[1] ? z : H }), r2.removeAttribute(t3);
        } else t3.startsWith(o$2) && (d2.push({ type: 6, index: l2 }), r2.removeAttribute(t3));
        if (y2.test(r2.tagName)) {
          const t3 = r2.textContent.split(o$2), i3 = t3.length - 1;
          if (i3 > 0) {
            r2.textContent = s$1 ? s$1.emptyScript : "";
            for (let s2 = 0; s2 < i3; s2++) r2.append(t3[s2], c()), P.nextNode(), d2.push({ type: 2, index: ++l2 });
            r2.append(t3[i3], c());
          }
        }
      } else if (8 === r2.nodeType) if (r2.data === n$1) d2.push({ type: 2, index: l2 });
      else {
        let t3 = -1;
        for (; -1 !== (t3 = r2.data.indexOf(o$2, t3 + 1)); ) d2.push({ type: 7, index: l2 }), t3 += o$2.length - 1;
      }
      l2++;
    }
  }
  static createElement(t2, i2) {
    const s2 = l.createElement("template");
    return s2.innerHTML = t2, s2;
  }
}
function M(t2, i2, s2 = t2, e2) {
  if (i2 === E) return i2;
  let h2 = void 0 !== e2 ? s2._$Co?.[e2] : s2._$Cl;
  const o2 = a(i2) ? void 0 : i2._$litDirective$;
  return h2?.constructor !== o2 && (h2?._$AO?.(false), void 0 === o2 ? h2 = void 0 : (h2 = new o2(t2), h2._$AT(t2, s2, e2)), void 0 !== e2 ? (s2._$Co ?? (s2._$Co = []))[e2] = h2 : s2._$Cl = h2), void 0 !== h2 && (i2 = M(t2, h2._$AS(t2, i2.values), h2, e2)), i2;
}
class R {
  constructor(t2, i2) {
    this._$AV = [], this._$AN = void 0, this._$AD = t2, this._$AM = i2;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t2) {
    const { el: { content: i2 }, parts: s2 } = this._$AD, e2 = (t2?.creationScope ?? l).importNode(i2, true);
    P.currentNode = e2;
    let h2 = P.nextNode(), o2 = 0, n3 = 0, r2 = s2[0];
    for (; void 0 !== r2; ) {
      if (o2 === r2.index) {
        let i3;
        2 === r2.type ? i3 = new k(h2, h2.nextSibling, this, t2) : 1 === r2.type ? i3 = new r2.ctor(h2, r2.name, r2.strings, this, t2) : 6 === r2.type && (i3 = new Z(h2, this, t2)), this._$AV.push(i3), r2 = s2[++n3];
      }
      o2 !== r2?.index && (h2 = P.nextNode(), o2++);
    }
    return P.currentNode = l, e2;
  }
  p(t2) {
    let i2 = 0;
    for (const s2 of this._$AV) void 0 !== s2 && (void 0 !== s2.strings ? (s2._$AI(t2, s2, i2), i2 += s2.strings.length - 2) : s2._$AI(t2[i2])), i2++;
  }
}
class k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t2, i2, s2, e2) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t2, this._$AB = i2, this._$AM = s2, this.options = e2, this._$Cv = e2?.isConnected ?? true;
  }
  get parentNode() {
    let t2 = this._$AA.parentNode;
    const i2 = this._$AM;
    return void 0 !== i2 && 11 === t2?.nodeType && (t2 = i2.parentNode), t2;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t2, i2 = this) {
    t2 = M(this, t2, i2), a(t2) ? t2 === A || null == t2 || "" === t2 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t2 !== this._$AH && t2 !== E && this._(t2) : void 0 !== t2._$litType$ ? this.$(t2) : void 0 !== t2.nodeType ? this.T(t2) : d(t2) ? this.k(t2) : this._(t2);
  }
  O(t2) {
    return this._$AA.parentNode.insertBefore(t2, this._$AB);
  }
  T(t2) {
    this._$AH !== t2 && (this._$AR(), this._$AH = this.O(t2));
  }
  _(t2) {
    this._$AH !== A && a(this._$AH) ? this._$AA.nextSibling.data = t2 : this.T(l.createTextNode(t2)), this._$AH = t2;
  }
  $(t2) {
    const { values: i2, _$litType$: s2 } = t2, e2 = "number" == typeof s2 ? this._$AC(t2) : (void 0 === s2.el && (s2.el = S.createElement(V(s2.h, s2.h[0]), this.options)), s2);
    if (this._$AH?._$AD === e2) this._$AH.p(i2);
    else {
      const t3 = new R(e2, this), s3 = t3.u(this.options);
      t3.p(i2), this.T(s3), this._$AH = t3;
    }
  }
  _$AC(t2) {
    let i2 = C.get(t2.strings);
    return void 0 === i2 && C.set(t2.strings, i2 = new S(t2)), i2;
  }
  k(t2) {
    u(this._$AH) || (this._$AH = [], this._$AR());
    const i2 = this._$AH;
    let s2, e2 = 0;
    for (const h2 of t2) e2 === i2.length ? i2.push(s2 = new k(this.O(c()), this.O(c()), this, this.options)) : s2 = i2[e2], s2._$AI(h2), e2++;
    e2 < i2.length && (this._$AR(s2 && s2._$AB.nextSibling, e2), i2.length = e2);
  }
  _$AR(t2 = this._$AA.nextSibling, s2) {
    for (this._$AP?.(false, true, s2); t2 !== this._$AB; ) {
      const s3 = i$1(t2).nextSibling;
      i$1(t2).remove(), t2 = s3;
    }
  }
  setConnected(t2) {
    void 0 === this._$AM && (this._$Cv = t2, this._$AP?.(t2));
  }
}
class H {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t2, i2, s2, e2, h2) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t2, this.name = i2, this._$AM = e2, this.options = h2, s2.length > 2 || "" !== s2[0] || "" !== s2[1] ? (this._$AH = Array(s2.length - 1).fill(new String()), this.strings = s2) : this._$AH = A;
  }
  _$AI(t2, i2 = this, s2, e2) {
    const h2 = this.strings;
    let o2 = false;
    if (void 0 === h2) t2 = M(this, t2, i2, 0), o2 = !a(t2) || t2 !== this._$AH && t2 !== E, o2 && (this._$AH = t2);
    else {
      const e3 = t2;
      let n3, r2;
      for (t2 = h2[0], n3 = 0; n3 < h2.length - 1; n3++) r2 = M(this, e3[s2 + n3], i2, n3), r2 === E && (r2 = this._$AH[n3]), o2 || (o2 = !a(r2) || r2 !== this._$AH[n3]), r2 === A ? t2 = A : t2 !== A && (t2 += (r2 ?? "") + h2[n3 + 1]), this._$AH[n3] = r2;
    }
    o2 && !e2 && this.j(t2);
  }
  j(t2) {
    t2 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t2 ?? "");
  }
}
class I extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t2) {
    this.element[this.name] = t2 === A ? void 0 : t2;
  }
}
class L extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t2) {
    this.element.toggleAttribute(this.name, !!t2 && t2 !== A);
  }
}
class z extends H {
  constructor(t2, i2, s2, e2, h2) {
    super(t2, i2, s2, e2, h2), this.type = 5;
  }
  _$AI(t2, i2 = this) {
    if ((t2 = M(this, t2, i2, 0) ?? A) === E) return;
    const s2 = this._$AH, e2 = t2 === A && s2 !== A || t2.capture !== s2.capture || t2.once !== s2.once || t2.passive !== s2.passive, h2 = t2 !== A && (s2 === A || e2);
    e2 && this.element.removeEventListener(this.name, this, s2), h2 && this.element.addEventListener(this.name, this, t2), this._$AH = t2;
  }
  handleEvent(t2) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t2) : this._$AH.handleEvent(t2);
  }
}
class Z {
  constructor(t2, i2, s2) {
    this.element = t2, this.type = 6, this._$AN = void 0, this._$AM = i2, this.options = s2;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t2) {
    M(this, t2);
  }
}
const B = t$1.litHtmlPolyfillSupport;
B?.(S, k), (t$1.litHtmlVersions ?? (t$1.litHtmlVersions = [])).push("3.3.3");
const D = (t2, i2, s2) => {
  const e2 = s2?.renderBefore ?? i2;
  let h2 = e2._$litPart$;
  if (void 0 === h2) {
    const t3 = s2?.renderBefore ?? null;
    e2._$litPart$ = h2 = new k(i2.insertBefore(c(), t3), t3, void 0, s2 ?? {});
  }
  return h2._$AI(t2), h2;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const s = globalThis;
class i extends y$1 {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var _a;
    const t2 = super.createRenderRoot();
    return (_a = this.renderOptions).renderBefore ?? (_a.renderBefore = t2.firstChild), t2;
  }
  update(t2) {
    const r2 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t2), this._$Do = D(r2, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
}
i._$litElement$ = true, i["finalized"] = true, s.litElementHydrateSupport?.({ LitElement: i });
const o$1 = s.litElementPolyfillSupport;
o$1?.({ LitElement: i });
(s.litElementVersions ?? (s.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t = (t2) => (e2, o2) => {
  void 0 !== o2 ? o2.addInitializer(() => {
    customElements.define(t2, e2);
  }) : customElements.define(t2, e2);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const o = { attribute: true, type: String, converter: u$1, reflect: false, hasChanged: f$1 }, r$1 = (t2 = o, e2, r2) => {
  const { kind: n3, metadata: i2 } = r2;
  let s2 = globalThis.litPropertyMetadata.get(i2);
  if (void 0 === s2 && globalThis.litPropertyMetadata.set(i2, s2 = /* @__PURE__ */ new Map()), "setter" === n3 && ((t2 = Object.create(t2)).wrapped = true), s2.set(r2.name, t2), "accessor" === n3) {
    const { name: o2 } = r2;
    return { set(r3) {
      const n4 = e2.get.call(this);
      e2.set.call(this, r3), this.requestUpdate(o2, n4, t2, true, r3);
    }, init(e3) {
      return void 0 !== e3 && this.C(o2, void 0, t2, e3), e3;
    } };
  }
  if ("setter" === n3) {
    const { name: o2 } = r2;
    return function(r3) {
      const n4 = this[o2];
      e2.call(this, r3), this.requestUpdate(o2, n4, t2, true, r3);
    };
  }
  throw Error("Unsupported decorator location: " + n3);
};
function n2(t2) {
  return (e2, o2) => "object" == typeof o2 ? r$1(t2, e2, o2) : ((t3, e3, o3) => {
    const r2 = e3.hasOwnProperty(o3);
    return e3.constructor.createProperty(o3, t3), r2 ? Object.getOwnPropertyDescriptor(e3, o3) : void 0;
  })(t2, e2, o2);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function r(r2) {
  return n2({ ...r2, state: true, attribute: false });
}
const CHANNEL_COLOR = {
  binary: "#3B82F6",
  //cobalt
  numeric: "#EF4444",
  //coral
  text: "#A78BFA",
  //lavender
  switch: "#10B981",
  //emerald
  light: "#F59E0B",
  //amber
  climate: "#F97316",
  //orange
  cover: "#06B6D4",
  //cyan
  lock: "#F43F5E",
  //rose
  media: "#EC4899",
  //pink
  presence: "#8B5CF6",
  //violet
  weather: "#FACC15",
  //gold
  system: "#14B8A6",
  //teal
  trigger: "#A3E635",
  //lime
  alarm: "#DC2626",
  //crimson
  appliance: "#0EA5E9",
  //sky
  update: "#D946EF",
  //magenta
  input: "#C084FC",
  //pastel violet
  fallback: "#94A3B8"
  //slate
};
const CHANNEL_LABEL = {
  binary: "Binary",
  numeric: "Numeric",
  text: "Text",
  switch: "Switch",
  light: "Light",
  climate: "Climate",
  cover: "Cover",
  lock: "Lock",
  media: "Media",
  presence: "Presence",
  weather: "Weather",
  system: "Automation",
  trigger: "Trigger",
  alarm: "Alarm",
  appliance: "Appliance",
  update: "Update",
  input: "Input",
  fallback: "Other"
};
const DOMAIN_CHANNEL = {
  binary_sensor: "binary",
  sensor: "numeric",
  //refined to 'text' at runtime when state is a non-numeric string
  switch: "switch",
  input_boolean: "switch",
  light: "light",
  climate: "climate",
  water_heater: "climate",
  cover: "cover",
  garage_door: "cover",
  lock: "lock",
  media_player: "media",
  remote: "media",
  person: "presence",
  device_tracker: "presence",
  zone: "presence",
  weather: "weather",
  sun: "weather",
  automation: "system",
  script: "system",
  scene: "system",
  button: "trigger",
  input_button: "trigger",
  event: "trigger",
  alarm_control_panel: "alarm",
  siren: "alarm",
  vacuum: "appliance",
  fan: "appliance",
  humidifier: "appliance",
  update: "update",
  input_select: "text",
  input_text: "text",
  input_number: "input",
  counter: "input",
  number: "input",
  timer: "input"
};
function domainOf(entityId) {
  const dot = entityId.indexOf(".");
  return dot === -1 ? entityId : entityId.slice(0, dot);
}
function channelFor(entityId, state) {
  const domain = domainOf(entityId);
  const channel = DOMAIN_CHANNEL[domain] ?? "fallback";
  if (channel === "numeric" && !isNumeric(state)) {
    return "text";
  }
  return channel;
}
function colorFor(entityId, state) {
  return CHANNEL_COLOR[channelFor(entityId, state)];
}
function isNumeric(value) {
  if (value === null || value === void 0 || value === "") {
    return false;
  }
  const n3 = Number(value);
  return Number.isFinite(n3);
}
function magnitudeFor(channel, oldState, newState, ctx) {
  if (channel === "switch" || channel === "light" || channel === "binary" || channel === "lock" || channel === "cover" || channel === "alarm") {
    return isOnLike(newState) ? 0.85 : 0.4;
  }
  if (channel === "numeric" || channel === "input") {
    const a2 = Number(oldState);
    const b2 = Number(newState);
    if (!Number.isFinite(a2) || !Number.isFinite(b2)) {
      return 0.5;
    }
    const delta = Math.abs(b2 - a2);
    if (ctx.deltaEma <= 0) {
      return delta === 0 ? 0.35 : 0.6;
    }
    const ratio = delta / (ctx.deltaEma * 2);
    return 0.35 + 0.55 * (1 - Math.exp(-ratio));
  }
  return 0.65;
}
function isOnLike(state) {
  if (!state) {
    return false;
  }
  switch (state.toLowerCase()) {
    case "on":
    case "open":
    case "unlocked":
    case "home":
    case "playing":
    case "active":
    case "cleaning":
    case "heating":
    case "cooling":
    case "true":
      return true;
    default:
      return false;
  }
}
function updateDeltaEma(prev, sample, alpha = 0.15) {
  if (prev <= 0) {
    return sample;
  }
  return prev * (1 - alpha) + sample * alpha;
}
const DEFAULT_INCLUDE_DOMAINS = [
  "binary_sensor",
  "sensor",
  "switch",
  "light",
  "climate",
  "cover",
  "lock",
  "media_player",
  "person",
  "device_tracker",
  "weather",
  "automation",
  "script",
  "button",
  "input_boolean",
  "input_number",
  "input_select",
  "input_text",
  "input_button",
  "vacuum",
  "fan",
  "humidifier",
  "water_heater",
  "remote",
  "siren",
  "alarm_control_panel",
  "scene"
];
class HermesEngine {
  constructor(cfg) {
    this.hass = null;
    this.unsubscribe = null;
    this.pendingSub = null;
    this.pings = [];
    this.lanes = /* @__PURE__ */ new Map();
    this.stats = /* @__PURE__ */ new Map();
    this.nextPingId = 1;
    this.nextLaneIndex = 0;
    this.explicitEntities = null;
    this.entityPatterns = [];
    this.excludeEntities = /* @__PURE__ */ new Set();
    this.excludeDomains = /* @__PURE__ */ new Set();
    this.includeDomains = new Set(DEFAULT_INCLUDE_DOMAINS);
    this.listeners = /* @__PURE__ */ new Set();
    this.cfg = cfg;
    this.recompileFilters();
  }
  //----- public API -----
  setConfig(cfg) {
    this.cfg = cfg;
    this.recompileFilters();
    this.evictByCap();
    this.notify();
  }
  getConfig() {
    return this.cfg;
  }
  //Bind to a hass object. Idempotent: a second call with the
  //same instance is a no-op. Reconnects if the instance has
  //changed (HA hands cards a fresh `hass` per WebSocket reset).
  bind(hass) {
    if (this.hass === hass) {
      return;
    }
    this.unbind();
    this.hass = hass;
    this.pendingSub = hass.connection.subscribeEvents(
      (ev) => this.handleStateChanged(ev),
      "state_changed"
    );
    this.pendingSub.then((unsub) => {
      if (this.hass !== hass) {
        unsub();
        return;
      }
      this.unsubscribe = unsub;
    }).catch((err) => {
      console.warn("[hermes] subscribeEvents failed:", err);
    });
  }
  unbind() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.pendingSub = null;
    this.hass = null;
  }
  //Subscribe to "state changed" notifications. Returns the
  //unsubscriber. The engine debounces nothing on purpose: the
  //card itself only schedules a frame when something happened.
  onUpdate(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  //One-shot read for the renderer. The returned arrays are the
  //engine's own storage, marked readonly at the type level so
  //the renderer cannot mutate them by accident.
  getSnapshot() {
    const now = Date.now();
    const timespanMs = Math.max(1e3, this.cfg.timespan_seconds * 1e3);
    this.evictExpired(now, timespanMs);
    return {
      pings: this.pings,
      lanes: this.computeOrderedLanes(),
      now,
      timespanMs
    };
  }
  //Friendly count of distinct entities that have pinged. Used
  //by the editor preview.
  getLaneCount() {
    return this.lanes.size;
  }
  //Manually inject a ping. Useful for the editor preview where
  //we want a demo without a real hass connection.
  injectDemoPing(entityId, newState, oldState = null) {
    this.recordPing(entityId, oldState, newState, null, null);
    this.notify();
  }
  //----- internals -----
  recompileFilters() {
    const list = this.cfg.entities;
    if (list && list.length > 0) {
      this.explicitEntities = /* @__PURE__ */ new Set();
      this.entityPatterns = [];
      for (const raw of list) {
        if (raw.includes("*") || raw.includes("?")) {
          this.entityPatterns.push(globToRegExp(raw));
        } else {
          this.explicitEntities.add(raw);
        }
      }
    } else {
      this.explicitEntities = null;
      this.entityPatterns = [];
    }
    this.includeDomains = new Set(this.cfg.include_domains ?? DEFAULT_INCLUDE_DOMAINS);
    this.excludeEntities = new Set(this.cfg.exclude_entities ?? []);
    this.excludeDomains = new Set(this.cfg.exclude_domains ?? []);
  }
  accepts(entityId) {
    if (this.excludeEntities.has(entityId)) {
      return false;
    }
    const domain = domainOf(entityId);
    if (this.excludeDomains.has(domain)) {
      return false;
    }
    if (this.explicitEntities !== null || this.entityPatterns.length > 0) {
      if (this.explicitEntities?.has(entityId)) {
        return true;
      }
      for (const re of this.entityPatterns) {
        if (re.test(entityId)) {
          return true;
        }
      }
      return false;
    }
    return this.includeDomains.has(domain);
  }
  handleStateChanged(ev) {
    const { entity_id, new_state, old_state } = ev.data;
    if (!this.accepts(entity_id)) {
      return;
    }
    const newRaw = new_state?.state ?? null;
    const oldRaw = old_state?.state ?? null;
    if (newRaw === oldRaw) {
      return;
    }
    if (this.cfg.ignore_unavailable !== false) {
      if (isConnectivityBlip(oldRaw, newRaw)) {
        return;
      }
    }
    const friendly = new_state?.attributes?.friendly_name ?? old_state?.attributes?.friendly_name ?? entity_id;
    const unit = new_state?.attributes?.unit_of_measurement ?? null;
    this.recordPing(entity_id, oldRaw, newRaw, friendly, unit);
    this.notify();
  }
  recordPing(entityId, oldRaw, newRaw, friendly, unit) {
    const channel = channelFor(entityId, newRaw);
    const color = colorFor(entityId, newRaw);
    let s2 = this.stats.get(entityId);
    if (!s2) {
      s2 = { lastState: oldRaw, deltaEma: 0 };
      this.stats.set(entityId, s2);
    }
    const a2 = Number(oldRaw);
    const b2 = Number(newRaw);
    if (Number.isFinite(a2) && Number.isFinite(b2)) {
      s2.deltaEma = updateDeltaEma(s2.deltaEma, Math.abs(b2 - a2));
    }
    s2.lastState = newRaw;
    const ctx = { deltaEma: s2.deltaEma };
    const magnitude = magnitudeFor(channel, oldRaw, newRaw, ctx);
    const finalFriendly = friendly ?? entityId;
    let lane = this.lanes.get(entityId);
    if (!lane) {
      lane = {
        entityId,
        friendlyName: finalFriendly,
        channel,
        color,
        laneIndex: this.nextLaneIndex++,
        lastPingTs: Date.now(),
        lastState: newRaw,
        unit
      };
      this.lanes.set(entityId, lane);
    } else {
      lane.friendlyName = finalFriendly;
      lane.channel = channel;
      lane.color = color;
      lane.lastPingTs = Date.now();
      lane.lastState = newRaw;
      if (unit !== null) lane.unit = unit;
    }
    this.pings.push({
      id: this.nextPingId++,
      entityId,
      friendlyName: finalFriendly,
      channel,
      color,
      magnitude,
      oldState: oldRaw,
      newState: newRaw,
      unit: unit ?? lane.unit,
      ts: Date.now()
    });
    this.evictByCap();
  }
  //Drop pings older than the visible window. Cheap because
  //the buffer is roughly time-ordered (state_changed events
  //arrive monotonically and we only ever push to the tail).
  evictExpired(now, timespanMs) {
    const cutoff = now - timespanMs;
    let drop = 0;
    while (drop < this.pings.length && this.pings[drop].ts < cutoff) {
      drop++;
    }
    if (drop > 0) {
      this.pings.splice(0, drop);
    }
  }
  evictByCap() {
    const over = this.pings.length - this.cfg.max_pings;
    if (over > 0) {
      this.pings.splice(0, over);
    }
  }
  //Lanes are stored unordered (insertion order via Map). Most
  //of the time we want them sorted by laneIndex; do it lazily
  //so the engine stays cheap to mutate.
  computeOrderedLanes() {
    const arr = Array.from(this.lanes.values());
    arr.sort((a2, b2) => a2.laneIndex - b2.laneIndex);
    return arr;
  }
  notify() {
    for (const cb of this.listeners) {
      try {
        cb();
      } catch (err) {
        console.warn("[hermes] listener threw:", err);
      }
    }
  }
}
function globToRegExp(glob) {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const pattern = escaped.replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(`^${pattern}$`);
}
function isConnectivityBlip(oldRaw, newRaw) {
  const a2 = isMissingState(oldRaw);
  const b2 = isMissingState(newRaw);
  return a2 || b2;
}
function isMissingState(s2) {
  return s2 === null || s2 === "" || s2 === "unavailable" || s2 === "unknown";
}
const HERMES_VERSION = "0.1.0";
const hermesCardStyles = i$3`
    :host
    {
        display: block;
        --hermes-bg:           #0a0c10;
        --hermes-bg-grad-1:    #0c0f15;
        --hermes-bg-grad-2:    #07090c;
        --hermes-fg:           #e7ecf3;
        --hermes-fg-dim:       #9aa3b2;
        --hermes-fg-mute:      #5a6273;
        --hermes-rule:         rgba(255, 255, 255, 0.06);
        --hermes-rule-strong:  rgba(255, 255, 255, 0.12);
        --hermes-tooltip-bg:   rgba(16, 19, 26, 0.92);
        --hermes-tooltip-bd:   rgba(255, 255, 255, 0.08);
        --hermes-label-font:
            ui-sans-serif, system-ui, -apple-system, "Segoe UI",
            "Inter", "Helvetica Neue", Arial, sans-serif;
        --hermes-mono-font:
            ui-monospace, SFMono-Regular, "SF Mono", Menlo,
            Consolas, "Liberation Mono", monospace;
    }

    .root
    {
        position: relative;
        width: 100%;
        background: radial-gradient(
            120% 100% at 60% 0%,
            var(--hermes-bg-grad-1) 0%,
            var(--hermes-bg-grad-2) 100%
        );
        color: var(--hermes-fg);
        border-radius: var(--ha-card-border-radius, 14px);
        overflow: hidden;
        font-family: var(--hermes-label-font);
        -webkit-font-smoothing: antialiased;
        box-shadow:
            inset 0 0 0 1px rgba(255, 255, 255, 0.03),
            inset 0 -40px 80px -40px rgba(0, 0, 0, 0.6);
    }

    .header
    {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 18px 10px 18px;
        border-bottom: 1px solid var(--hermes-rule);
    }

    .header .title
    {
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.02em;
        color: var(--hermes-fg);
    }

    .header .subtitle
    {
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--hermes-fg-mute);
    }

    .header .spacer
    {
        flex: 1;
    }

    .header .legend
    {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 10px;
        font-size: 10.5px;
        color: var(--hermes-fg-dim);
        max-width: 60%;
        justify-content: flex-end;
    }

    .header .legend .chip
    {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
    }

    .header .legend .swatch
    {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        box-shadow: 0 0 6px currentColor;
    }

    .stage
    {
        position: relative;
        width: 100%;
        /* Default min height; the card resizes to host's height. */
        min-height: 220px;
    }

    canvas
    {
        display: block;
        width: 100%;
        height: 100%;
        position: absolute;
        inset: 0;
    }

    .tooltip
    {
        position: absolute;
        z-index: 3;
        pointer-events: none;
        background: var(--hermes-tooltip-bg);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid var(--hermes-tooltip-bd);
        border-radius: 10px;
        padding: 8px 10px;
        min-width: 140px;
        max-width: 280px;
        font-size: 11.5px;
        line-height: 1.35;
        color: var(--hermes-fg);
        box-shadow:
            0 8px 24px rgba(0, 0, 0, 0.45),
            0 0 0 1px rgba(0, 0, 0, 0.3);
        transform: translate(-50%, calc(-100% - 10px));
        opacity: 0;
        transition: opacity 90ms ease-out;
    }

    .tooltip.visible
    {
        opacity: 1;
    }

    .tooltip .tt-name
    {
        font-weight: 600;
        margin-bottom: 2px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .tooltip .tt-id
    {
        font-family: var(--hermes-mono-font);
        font-size: 10px;
        color: var(--hermes-fg-mute);
        margin-bottom: 6px;
        word-break: break-all;
    }

    .tooltip .tt-row
    {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        color: var(--hermes-fg-dim);
        font-size: 11px;
    }

    .tooltip .tt-row .label
    {
        color: var(--hermes-fg-mute);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-size: 10px;
    }

    .tooltip .tt-row .value
    {
        font-family: var(--hermes-mono-font);
        color: var(--hermes-fg);
        text-align: right;
        word-break: break-all;
    }

    .tooltip .tt-arrow
    {
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
        width: 8px;
        height: 8px;
        background: var(--hermes-tooltip-bg);
        border-right: 1px solid var(--hermes-tooltip-bd);
        border-bottom: 1px solid var(--hermes-tooltip-bd);
    }

    .empty
    {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: var(--hermes-fg-mute);
        font-size: 12px;
        pointer-events: none;
        text-align: center;
        padding: 0 24px;
    }

    .empty .pulse
    {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--hermes-fg-mute);
        margin-bottom: 8px;
        animation: hermes-pulse 1.6s ease-in-out infinite;
    }

    @keyframes hermes-pulse
    {
        0%, 100% { opacity: 0.3; transform: scale(1);   }
        50%      { opacity: 0.9; transform: scale(1.6); }
    }

    /* Editor scaffolding kept here so it shares the same surface
       look as the card itself. */
    .editor
    {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px 0;
        font-family: var(--hermes-label-font);
    }

    .editor .row
    {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .editor .row > label
    {
        font-size: 12px;
        color: var(--secondary-text-color, #aaa);
    }

    .editor .row input,
    .editor .row textarea
    {
        background: var(--card-background-color, #1c1f24);
        color: var(--primary-text-color, #eee);
        border: 1px solid var(--divider-color, #333);
        border-radius: 8px;
        padding: 8px 10px;
        font: inherit;
    }

    .editor .row textarea
    {
        min-height: 84px;
        resize: vertical;
        font-family: var(--hermes-mono-font);
        font-size: 12px;
    }

    .editor .hint
    {
        font-size: 11px;
        color: var(--secondary-text-color, #aaa);
        line-height: 1.4;
    }
`;
const en = {
  cardName: "Hermes",
  cardDescription: "Real-time entity activity pulse",
  entity: "entity",
  entities: "entities",
  emptyTitle: "Listening…",
  emptyHint: "A sphere will appear for every entity state change.",
  tooltipValue: "Value",
  tooltipPrevious: "Previous",
  tooltipAgo: "Seen",
  justNow: "just now",
  unitSec: "s ago",
  unitMin: "min ago",
  unitHour: "h ago",
  editorTitle: "Title",
  editorTimespan: "Visible window (seconds)",
  editorHeight: "Card height (px)",
  editorLabelWidth: "Label gutter (px, 0 to hide)",
  editorShowLegend: "Show legend",
  editorShowLastValue: "Show last value next to label",
  editorMaxPings: "Max retained pings",
  editorEntities: "Entities (one per line, supports * and ?)",
  editorEntitiesHint: "Leave empty to track all entities in the allowed domains below.",
  editorIncludeDomains: "Allowed domains (comma-separated)",
  editorExcludeEntities: "Excluded entities (one per line)",
  editorExcludeDomains: "Excluded domains (comma-separated)",
  editorIgnoreUnavailable: "Ignore unavailable / unknown blips"
};
const fr = {
  cardName: "Hermes",
  cardDescription: "Pouls d'activité des entités en temps réel",
  entity: "entité",
  entities: "entités",
  emptyTitle: "À l'écoute…",
  emptyHint: "Une sphère apparaîtra pour chaque changement d'état d'entité.",
  tooltipValue: "Valeur",
  tooltipPrevious: "Précédente",
  tooltipAgo: "Vu",
  justNow: "à l'instant",
  unitSec: "s",
  unitMin: "min",
  unitHour: "h",
  editorTitle: "Titre",
  editorTimespan: "Fenêtre visible (secondes)",
  editorHeight: "Hauteur de la carte (px)",
  editorLabelWidth: "Marge des libellés (px, 0 pour masquer)",
  editorShowLegend: "Afficher la légende",
  editorShowLastValue: "Afficher la dernière valeur près du libellé",
  editorMaxPings: "Pings retenus (max)",
  editorEntities: "Entités (une par ligne, * et ? acceptés)",
  editorEntitiesHint: "Laissez vide pour suivre toutes les entités des domaines autorisés ci-dessous.",
  editorIncludeDomains: "Domaines autorisés (séparés par des virgules)",
  editorExcludeEntities: "Entités exclues (une par ligne)",
  editorExcludeDomains: "Domaines exclus (séparés par des virgules)",
  editorIgnoreUnavailable: "Ignorer les passages indisponible / inconnu"
};
const TABLE = {
  en,
  fr
};
function pickTranslations(language) {
  if (!language) return en;
  const tag = language.toLowerCase();
  if (TABLE[tag]) return TABLE[tag];
  const primary = tag.split("-")[0];
  if (TABLE[primary]) return TABLE[primary];
  return en;
}
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __decorateClass$1 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$1(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$1(target, key, result);
  return result;
};
let HermesCardEditor = class extends i {
  constructor() {
    super(...arguments);
    this._config = { type: "custom:hermes-card" };
    this._i18n = pickTranslations(
      typeof navigator !== "undefined" ? navigator.language : "en"
    );
  }
  setConfig(config) {
    this._config = { ...config, type: "custom:hermes-card" };
  }
  render() {
    const c2 = this._config;
    const i2 = this._i18n;
    const domainsCsv = (c2.include_domains ?? [...DEFAULT_INCLUDE_DOMAINS]).join(", ");
    const excludeDomainsCsv = (c2.exclude_domains ?? []).join(", ");
    const entitiesText = (c2.entities ?? []).join("\n");
    const excludeEntitiesText = (c2.exclude_entities ?? []).join("\n");
    return b`
            <div class="editor">
                <div class="row">
                    <label>${i2.editorTitle}</label>
                    <input
                        type="text"
                        .value=${c2.title ?? "Activity"}
                        @input=${(e2) => this._update("title", e2.target.value)}
                    />
                </div>

                <div class="row">
                    <label>${i2.editorTimespan}</label>
                    <input
                        type="number"
                        min="10"
                        max="86400"
                        step="10"
                        .value=${String(c2.timespan_seconds ?? 300)}
                        @input=${(e2) => this._updateNum("timespan_seconds", e2.target.value)}
                    />
                </div>

                <div class="row">
                    <label>${i2.editorHeight}</label>
                    <input
                        type="number"
                        min="140"
                        max="1200"
                        step="10"
                        .value=${String(c2.height ?? 320)}
                        @input=${(e2) => this._updateNum("height", e2.target.value)}
                    />
                </div>

                <div class="row">
                    <label>${i2.editorLabelWidth}</label>
                    <input
                        type="number"
                        min="0"
                        max="320"
                        step="4"
                        .value=${String(c2.label_width ?? 168)}
                        @input=${(e2) => this._updateNum("label_width", e2.target.value)}
                    />
                </div>

                <div class="row">
                    <label>${i2.editorMaxPings}</label>
                    <input
                        type="number"
                        min="50"
                        max="20000"
                        step="50"
                        .value=${String(c2.max_pings ?? 2e3)}
                        @input=${(e2) => this._updateNum("max_pings", e2.target.value)}
                    />
                </div>

                ${this._toggleRow(i2.editorShowLegend, "show_legend", c2.show_legend !== false)}
                ${this._toggleRow(i2.editorShowLastValue, "show_last_value", c2.show_last_value !== false)}
                ${this._toggleRow(i2.editorIgnoreUnavailable, "ignore_unavailable", c2.ignore_unavailable !== false)}

                <div class="row wide">
                    <label>${i2.editorEntities}</label>
                    <textarea
                        spellcheck="false"
                        @input=${(e2) => this._updateList("entities", e2.target.value, "\n")}
                    >${entitiesText}</textarea>
                    <div class="hint">${i2.editorEntitiesHint}</div>
                </div>

                <div class="row wide">
                    <label>${i2.editorIncludeDomains}</label>
                    <input
                        type="text"
                        .value=${domainsCsv}
                        @input=${(e2) => this._updateList("include_domains", e2.target.value, ",")}
                    />
                </div>

                <div class="row">
                    <label>${i2.editorExcludeEntities}</label>
                    <textarea
                        spellcheck="false"
                        @input=${(e2) => this._updateList("exclude_entities", e2.target.value, "\n")}
                    >${excludeEntitiesText}</textarea>
                </div>

                <div class="row">
                    <label>${i2.editorExcludeDomains}</label>
                    <input
                        type="text"
                        .value=${excludeDomainsCsv}
                        @input=${(e2) => this._updateList("exclude_domains", e2.target.value, ",")}
                    />
                </div>
            </div>
        `;
  }
  _toggleRow(label, key, current) {
    const id = `tgl-${String(key)}`;
    return b`
            <div class="row toggle">
                <input
                    id=${id}
                    type="checkbox"
                    .checked=${current}
                    @change=${(e2) => this._update(key, e2.target.checked)}
                />
                <label for=${id}>${label}</label>
            </div>
        `;
  }
  _update(key, value) {
    const next = { ...this._config, [key]: value };
    if (value === "" || value === void 0 || value === null) {
      delete next[key];
    }
    this._config = next;
    this._dispatch();
  }
  _updateNum(key, raw) {
    const n3 = Number(raw);
    if (!Number.isFinite(n3)) {
      return;
    }
    this._update(key, n3);
  }
  _updateList(key, raw, sep) {
    const list = raw.split(sep).map((s2) => s2.trim()).filter((s2) => s2.length > 0);
    if (list.length === 0) {
      const next = { ...this._config };
      delete next[key];
      this._config = next;
      this._dispatch();
      return;
    }
    this._update(key, list);
  }
  _dispatch() {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    }));
  }
};
HermesCardEditor.styles = i$3`
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
__decorateClass$1([
  n2({ attribute: false })
], HermesCardEditor.prototype, "hass", 2);
__decorateClass$1([
  r()
], HermesCardEditor.prototype, "_config", 2);
__decorateClass$1([
  r()
], HermesCardEditor.prototype, "_i18n", 2);
HermesCardEditor = __decorateClass$1([
  t("hermes-card-editor")
], HermesCardEditor);
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
const _bootI18n = pickTranslations(typeof navigator !== "undefined" ? navigator.language : "en");
window.customCards = window.customCards || [];
if (!window.customCards.some((c2) => c2.type === "hermes-card")) {
  window.customCards.push(
    {
      type: "hermes-card",
      name: _bootI18n.cardName,
      description: _bootI18n.cardDescription,
      preview: true
    }
  );
}
{
  const flagKey = "__hermesBannerPrinted";
  const w = window;
  if (!w[flagKey]) {
    w[flagKey] = true;
    const labelStyle = "background:#8b5cf6;color:#0a0c10;padding:2px 8px;border-radius:4px 0 0 4px;font-weight:bold;";
    const versionStyle = "background:#0a0c10;color:#8b5cf6;padding:2px 8px;border-radius:0 4px 4px 0;font-weight:bold;";
    console.info(
      `%c⚡ HERMES%c v${HERMES_VERSION}`,
      labelStyle,
      versionStyle
    );
  }
}
const EMPTY_TOOLTIP = {
  visible: false,
  x: 0,
  y: 0,
  pingId: 0,
  name: "",
  entityId: "",
  value: "",
  previous: "",
  ago: "",
  color: "#94A3B8"
};
const STAGE_PAD_TOP = 14;
const STAGE_PAD_BOTTOM = 14;
const STAGE_PAD_RIGHT = 18;
const LANE_GAP = 2;
const MIN_LANE_HEIGHT = 22;
const MAX_LANE_HEIGHT = 56;
const HIT_RADIUS_PAD = 6;
const FADE_TAIL_FRAC = 0.18;
let HermesCard = class extends i {
  constructor() {
    super(...arguments);
    this._config = resolveConfig({});
    this._tooltip = EMPTY_TOOLTIP;
    this._entityCount = 0;
    this._i18n = _bootI18n;
    this.engine = null;
    this.engineUnsubscribe = null;
    this.canvas = null;
    this.ctx = null;
    this.stageEl = null;
    this.resizeObserver = null;
    this.rafHandle = 0;
    this.dirty = true;
    this.mouseX = -1;
    this.mouseY = -1;
    this.stageWidth = 0;
    this.stageHeight = 0;
    this.dpr = 1;
    this.handleResize = () => {
      if (!this.stageEl || !this.canvas) return;
      const rect = this.stageEl.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const w = Math.max(0, Math.floor(rect.width));
      const h2 = Math.max(0, Math.floor(rect.height));
      if (this.stageWidth === w && this.stageHeight === h2 && this.dpr === dpr) {
        return;
      }
      this.stageWidth = w;
      this.stageHeight = h2;
      this.dpr = dpr;
      this.canvas.width = Math.max(1, Math.floor(w * dpr));
      this.canvas.height = Math.max(1, Math.floor(h2 * dpr));
      this.canvas.style.width = `${w}px`;
      this.canvas.style.height = `${h2}px`;
      this.dirty = true;
    };
    this.handleMouseMove = (ev) => {
      const rect = ev.currentTarget.getBoundingClientRect();
      this.mouseX = ev.clientX - rect.left;
      this.mouseY = ev.clientY - rect.top;
      this.dirty = true;
    };
    this.handleMouseLeave = () => {
      this.mouseX = -1;
      this.mouseY = -1;
      if (this._tooltip.visible) {
        this._tooltip = EMPTY_TOOLTIP;
      }
      this.dirty = true;
    };
    this.handleTouch = (ev) => {
      if (!ev.touches.length || !this.canvas) return;
      const t2 = ev.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = t2.clientX - rect.left;
      this.mouseY = t2.clientY - rect.top;
      this.dirty = true;
    };
  }
  //----- HA card contract -----
  static getConfigElement() {
    return document.createElement("hermes-card-editor");
  }
  static getStubConfig() {
    return {
      type: "custom:hermes-card",
      title: "Activity",
      timespan_seconds: 300
    };
  }
  setConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error("Invalid configuration");
    }
    const resolved = resolveConfig(config);
    const engineCfg = {
      timespan_seconds: resolved.timespanSeconds,
      max_pings: resolved.maxPings,
      ignore_unavailable: resolved.ignoreUnavailable,
      entities: resolved.entities,
      include_domains: resolved.includeDomains,
      exclude_entities: resolved.excludeEntities,
      exclude_domains: resolved.excludeDomains
    };
    if (!this.engine) {
      this.engine = new HermesEngine(engineCfg);
      this.engineUnsubscribe = this.engine.onUpdate(() => {
        this._entityCount = this.engine?.getLaneCount() ?? 0;
        this.requestRedraw();
      });
    } else {
      this.engine.setConfig(engineCfg);
    }
    this._config = resolved;
    this.dirty = true;
  }
  //Used by the masonry layout to pre-size the card before
  //first paint. Roughly one row per ~50 px.
  getCardSize() {
    return Math.max(3, Math.round(this._config.height / 50));
  }
  //----- lifecycle -----
  connectedCallback() {
    super.connectedCallback();
    if (typeof navigator !== "undefined") {
      this._i18n = pickTranslations(navigator.language);
    }
    this.startRaf();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.engineUnsubscribe) {
      this.engineUnsubscribe();
      this.engineUnsubscribe = null;
    }
    this.engine?.unbind();
    this.stopRaf();
    this.teardownObserver();
  }
  updated(changed) {
    super.updated(changed);
    if (!this.stageEl) {
      this.stageEl = this.renderRoot.querySelector(".stage");
    }
    if (!this.canvas) {
      this.canvas = this.renderRoot.querySelector("canvas");
      if (this.canvas) {
        this.ctx = this.canvas.getContext("2d", { alpha: true });
        this.canvas.addEventListener("mousemove", this.handleMouseMove);
        this.canvas.addEventListener("mouseleave", this.handleMouseLeave);
        this.canvas.addEventListener("touchstart", this.handleTouch, { passive: true });
        this.canvas.addEventListener("touchmove", this.handleTouch, { passive: true });
        this.canvas.addEventListener("touchend", this.handleMouseLeave);
      }
    }
    if (!this.resizeObserver && this.stageEl) {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(this.stageEl);
      this.handleResize();
    }
    if (changed.has("hass") && this.hass && this.engine) {
      this.engine.bind(this.hass);
    }
  }
  //----- render -----
  render() {
    const cfg = this._config;
    const tt = this._tooltip;
    return b`
            <ha-card>
                <div class="root" style=${`height:${cfg.height}px;`}>
                    <div class="header">
                        <div class="title">${cfg.title}</div>
                        <div class="subtitle">
                            ${this._entityCount} ${this._entityCount === 1 ? this._i18n.entity : this._i18n.entities}
                        </div>
                        <div class="spacer"></div>
                        ${cfg.showLegend ? this.renderLegend() : A}
                    </div>
                    <div class="stage">
                        <canvas></canvas>
                        ${this._entityCount === 0 ? this.renderEmpty() : A}
                        ${tt.visible ? this.renderTooltip(tt) : A}
                    </div>
                </div>
            </ha-card>
        `;
  }
  renderLegend() {
    const present = /* @__PURE__ */ new Set();
    if (this.engine) {
      for (const lane of this.engine.getSnapshot().lanes) {
        present.add(lane.channel);
      }
    }
    if (present.size === 0) {
      return b``;
    }
    const items = [];
    const orderedChannels = Object.keys(CHANNEL_COLOR);
    for (const ch of orderedChannels) {
      if (!present.has(ch)) {
        continue;
      }
      const color = CHANNEL_COLOR[ch];
      items.push(b`
                <span class="chip">
                    <span class="swatch" style=${`background:${color};color:${color};`}></span>
                    ${CHANNEL_LABEL[ch]}
                </span>
            `);
    }
    return b`<div class="legend">${items}</div>`;
  }
  renderEmpty() {
    return b`
            <div class="empty">
                <div class="pulse"></div>
                <div>${this._i18n.emptyTitle}</div>
                <div style="opacity:.7;font-size:11px;">${this._i18n.emptyHint}</div>
            </div>
        `;
  }
  renderTooltip(tt) {
    return b`
            <div
                class="tooltip visible"
                style=${`left:${tt.x}px;top:${tt.y}px;border-color:${withAlpha(tt.color, 0.4)};`}
            >
                <div class="tt-name" style=${`color:${tt.color};`}>${tt.name}</div>
                <div class="tt-id">${tt.entityId}</div>
                <div class="tt-row">
                    <span class="label">${this._i18n.tooltipValue}</span>
                    <span class="value">${tt.value}</span>
                </div>
                ${tt.previous ? b`
                    <div class="tt-row">
                        <span class="label">${this._i18n.tooltipPrevious}</span>
                        <span class="value">${tt.previous}</span>
                    </div>` : A}
                <div class="tt-row">
                    <span class="label">${this._i18n.tooltipAgo}</span>
                    <span class="value">${tt.ago}</span>
                </div>
                <div class="tt-arrow"></div>
            </div>
        `;
  }
  //----- canvas / animation -----
  startRaf() {
    if (this.rafHandle !== 0) return;
    const loop = () => {
      this.rafHandle = requestAnimationFrame(loop);
      this.paint();
    };
    this.rafHandle = requestAnimationFrame(loop);
  }
  stopRaf() {
    if (this.rafHandle !== 0) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = 0;
    }
  }
  requestRedraw() {
    this.dirty = true;
  }
  teardownObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.canvas) {
      this.canvas.removeEventListener("mousemove", this.handleMouseMove);
      this.canvas.removeEventListener("mouseleave", this.handleMouseLeave);
      this.canvas.removeEventListener("touchstart", this.handleTouch);
      this.canvas.removeEventListener("touchmove", this.handleTouch);
      this.canvas.removeEventListener("touchend", this.handleMouseLeave);
    }
  }
  paint() {
    if (!this.ctx || !this.canvas || !this.engine) return;
    if (this.stageWidth === 0 || this.stageHeight === 0) return;
    const snapshot = this.engine.getSnapshot();
    const hasMotion = snapshot.pings.length > 0;
    if (!hasMotion && !this.dirty) return;
    this.dirty = false;
    const ctx = this.ctx;
    const cfg = this._config;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);
    ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);
    const lanes = snapshot.lanes;
    const laneCount = Math.max(1, lanes.length);
    const labelW = cfg.labelWidth;
    const innerLeft = labelW;
    const innerRight = this.stageWidth - STAGE_PAD_RIGHT;
    const innerTop = STAGE_PAD_TOP;
    const innerBottom = this.stageHeight - STAGE_PAD_BOTTOM;
    const innerHeight = Math.max(0, innerBottom - innerTop);
    const innerWidth = Math.max(0, innerRight - innerLeft);
    let laneHeight = innerHeight / laneCount - LANE_GAP;
    laneHeight = Math.max(MIN_LANE_HEIGHT, Math.min(MAX_LANE_HEIGHT, laneHeight));
    const usedHeight = laneHeight * laneCount + LANE_GAP * (laneCount - 1);
    const yStart = innerTop + Math.max(0, (innerHeight - usedHeight) / 2);
    const laneByEntity = /* @__PURE__ */ new Map();
    for (let i2 = 0; i2 < lanes.length; i2++) {
      const lane = lanes[i2];
      const y3 = yStart + i2 * (laneHeight + LANE_GAP) + laneHeight / 2;
      laneByEntity.set(lane.entityId, { y: y3, h: laneHeight, color: lane.color, lane });
    }
    this.drawLaneTracks(ctx, lanes, laneByEntity, innerLeft, innerRight, labelW);
    const timespanMs = snapshot.timespanMs;
    const now = snapshot.now;
    let bestHit = null;
    for (let i2 = 0; i2 < snapshot.pings.length; i2++) {
      const p2 = snapshot.pings[i2];
      const lane = laneByEntity.get(p2.entityId);
      if (!lane) continue;
      const ageMs = now - p2.ts;
      const frac = ageMs / timespanMs;
      if (frac < 0 || frac > 1) continue;
      const x2 = innerRight - frac * innerWidth;
      const y3 = lane.y;
      const baseR = lane.h * 0.34;
      const r2 = Math.max(2.5, baseR * (0.5 + p2.magnitude * 0.6));
      const tailFrac = Math.max(0, (frac - (1 - FADE_TAIL_FRAC)) / FADE_TAIL_FRAC);
      const alpha = 1 - tailFrac;
      this.drawPing(ctx, x2, y3, r2, p2.color, alpha);
      if (this.mouseX >= 0) {
        const dx = x2 - this.mouseX;
        const dy = y3 - this.mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const reach = r2 + HIT_RADIUS_PAD;
        if (dist <= reach && (!bestHit || dist < bestHit.dist)) {
          bestHit = { ping: p2, dist, x: x2, y: y3, r: r2 };
        }
      }
    }
    ctx.restore();
    if (bestHit) {
      this.setTooltipFromPing(bestHit.ping, bestHit.x, bestHit.y, bestHit.r);
    } else if (this._tooltip.visible) {
      this._tooltip = EMPTY_TOOLTIP;
    }
  }
  drawLaneTracks(ctx, lanes, laneByEntity, innerLeft, innerRight, labelW) {
    const cfg = this._config;
    const labelFont = "500 11px " + getFontFamily();
    const valueFont = "400 10.5px " + getMonoFamily();
    const dimColor = "rgba(255,255,255,0.55)";
    const muteColor = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    ctx.setLineDash([1.5, 4]);
    for (const lane of lanes) {
      const slot = laneByEntity.get(lane.entityId);
      if (!slot) continue;
      ctx.strokeStyle = withAlpha(lane.color, 0.18);
      ctx.beginPath();
      ctx.moveTo(innerLeft, slot.y);
      ctx.lineTo(innerRight, slot.y);
      ctx.stroke();
      if (labelW > 0) {
        ctx.setLineDash([]);
        ctx.fillStyle = lane.color;
        ctx.beginPath();
        ctx.arc(12, slot.y, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = dimColor;
        ctx.font = labelFont;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillText(
          clipText(ctx, lane.friendlyName, labelW - 26 - (cfg.showLastValue ? 48 : 0)),
          22,
          slot.y
        );
        if (cfg.showLastValue && lane.lastState !== null) {
          ctx.fillStyle = muteColor;
          ctx.font = valueFont;
          ctx.textAlign = "right";
          const valueStr = formatLaneValue(lane.lastState, lane.unit);
          ctx.fillText(
            clipText(ctx, valueStr, 60),
            labelW - 8,
            slot.y
          );
        }
        ctx.setLineDash([1.5, 4]);
      }
    }
    ctx.setLineDash([]);
  }
  drawPing(ctx, x2, y3, r2, color, alpha) {
    const haloR = r2 * 2.8;
    const gradient = ctx.createRadialGradient(x2, y3, 0, x2, y3, haloR);
    gradient.addColorStop(0, withAlpha(color, 0.55 * alpha));
    gradient.addColorStop(0.35, withAlpha(color, 0.2 * alpha));
    gradient.addColorStop(1, withAlpha(color, 0));
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x2, y3, haloR, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = withAlpha(color, 0.95 * alpha);
    ctx.beginPath();
    ctx.arc(x2, y3, r2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 255, ${0.65 * alpha})`;
    ctx.beginPath();
    ctx.arc(x2 - r2 * 0.25, y3 - r2 * 0.25, Math.max(0.6, r2 * 0.18), 0, Math.PI * 2);
    ctx.fill();
  }
  setTooltipFromPing(p2, x2, y3, _r) {
    const ageMs = Date.now() - p2.ts;
    const ago = formatAgo(ageMs, this._i18n);
    const valueStr = formatLaneValue(p2.newState, p2.unit);
    const prevStr = p2.oldState !== null ? formatLaneValue(p2.oldState, p2.unit) : "";
    const next = {
      visible: true,
      x: Math.round(x2),
      y: Math.round(y3),
      pingId: p2.id,
      name: p2.friendlyName,
      entityId: p2.entityId,
      value: valueStr,
      previous: prevStr,
      ago,
      color: p2.color
    };
    if (this._tooltip.pingId === next.pingId && this._tooltip.x === next.x && this._tooltip.y === next.y && this._tooltip.value === next.value && this._tooltip.ago === next.ago) {
      return;
    }
    this._tooltip = next;
  }
};
HermesCard.styles = hermesCardStyles;
__decorateClass([
  n2({ attribute: false })
], HermesCard.prototype, "hass", 2);
__decorateClass([
  r()
], HermesCard.prototype, "_config", 2);
__decorateClass([
  r()
], HermesCard.prototype, "_tooltip", 2);
__decorateClass([
  r()
], HermesCard.prototype, "_entityCount", 2);
__decorateClass([
  r()
], HermesCard.prototype, "_i18n", 2);
HermesCard = __decorateClass([
  t("hermes-card")
], HermesCard);
function resolveConfig(cfg) {
  const showLabels = cfg.show_labels !== false;
  const labelWidth = showLabels ? clamp(cfg.label_width ?? 168, 0, 320) : 0;
  return {
    title: (cfg.title ?? "Activity").trim() || "Activity",
    timespanSeconds: clamp(cfg.timespan_seconds ?? 300, 10, 24 * 3600),
    height: clamp(cfg.height ?? 320, 140, 1200),
    labelWidth,
    showLegend: cfg.show_legend !== false,
    showLastValue: cfg.show_last_value !== false,
    maxPings: clamp(cfg.max_pings ?? 2e3, 50, 2e4),
    ignoreUnavailable: cfg.ignore_unavailable !== false,
    entities: arrOrUndef(cfg.entities),
    includeDomains: arrOrUndef(cfg.include_domains) ?? [...DEFAULT_INCLUDE_DOMAINS],
    excludeEntities: arrOrUndef(cfg.exclude_entities),
    excludeDomains: arrOrUndef(cfg.exclude_domains)
  };
}
function arrOrUndef(v2) {
  if (!Array.isArray(v2)) return void 0;
  const clean = v2.filter((x2) => typeof x2 === "string" && x2.length > 0);
  return clean.length > 0 ? clean : void 0;
}
function clamp(v2, lo, hi) {
  if (!Number.isFinite(v2)) return lo;
  return v2 < lo ? lo : v2 > hi ? hi : v2;
}
function withAlpha(hex, alpha) {
  const r2 = parseInt(hex.slice(1, 3), 16);
  const g2 = parseInt(hex.slice(3, 5), 16);
  const b2 = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r2}, ${g2}, ${b2}, ${alpha})`;
}
function clipText(ctx, text, maxWidth) {
  if (maxWidth <= 0 || ctx.measureText(text).width <= maxWidth) {
    return text;
  }
  const ellipsis = "…";
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = lo + hi + 1 >> 1;
    const candidate = text.slice(0, mid) + ellipsis;
    if (ctx.measureText(candidate).width <= maxWidth) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return text.slice(0, lo) + ellipsis;
}
function formatLaneValue(state2, unit) {
  if (state2 === null || state2 === "") return "—";
  const n3 = Number(state2);
  if (Number.isFinite(n3)) {
    const formatted = formatNumber(n3);
    return unit ? `${formatted} ${unit}` : formatted;
  }
  return state2;
}
function formatNumber(n3) {
  if (Math.abs(n3) >= 1e3) {
    return n3.toLocaleString(void 0, { maximumFractionDigits: 1 });
  }
  if (Math.abs(n3) >= 10) {
    return n3.toLocaleString(void 0, { maximumFractionDigits: 1 });
  }
  return n3.toLocaleString(void 0, { maximumFractionDigits: 2 });
}
function formatAgo(ms, i18n) {
  if (ms < 1500) return i18n.justNow;
  if (ms < 6e4) return `${Math.round(ms / 1e3)} ${i18n.unitSec}`;
  if (ms < 36e5) return `${Math.round(ms / 6e4)} ${i18n.unitMin}`;
  return `${(ms / 36e5).toFixed(1)} ${i18n.unitHour}`;
}
function getFontFamily() {
  return 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif';
}
function getMonoFamily() {
  return 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';
}
export {
  HermesCard
};
