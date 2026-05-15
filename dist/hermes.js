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
  //
  //`overrideNow` lets the renderer drive its own time cursor
  //independently of wall-clock time: when the user pauses the
  //timeline, the renderer freezes its cursor in the past and
  //passes that value here so eviction does not throw away
  //pings the user might still want to see, and so paused pings
  //arriving from the live event bus can later be replayed in
  //fast-forward.
  getSnapshot(overrideNow) {
    const now = overrideNow ?? Date.now();
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
        unit,
        pingCount: 0
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
    lane.pingCount++;
    this.pings.push({
      id: this.nextPingId++,
      entityId,
      friendlyName: finalFriendly,
      channel,
      color,
      magnitude,
      pingIndex: lane.pingCount,
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
const HERMES_VERSION = "0.5.1";
const hermesCardStyles = i$3`
    :host
    {
        display: block;
        width:   100%;
        height:  100%;
    }

    ha-card
    {
        position: relative;
        overflow: hidden;
        background: var(--hermes-bg-base, #0a0c10);
        color: var(--hermes-fg);
        border-radius: var(--ha-card-border-radius, 12px);
        font-family: var(--hermes-label-font);
        -webkit-font-smoothing: antialiased;
        width:      100%;
        height:     100%;
        min-height: 220px;
        /*  New stacking context so absolute children with z-index
            stay scoped to the card. */
        isolation: isolate;
        box-shadow:
            inset 0 0 0 1px var(--hermes-card-inset, rgba(255, 255, 255, 0.03)),
            inset 0 -40px 80px -40px var(--hermes-card-vignette, rgba(0, 0, 0, 0.6));
    }

    /*  Mini variant.
        The host gets a data-mini attribute in connectedCallback.
        Two things change versus the full card:
          - ha-card's min-height drops from 220 px to ~90 px so
            the card-picker preview cells and the sections-grid
            small slots don't overflow (this was what made the
            HA catalogue go haywire when both cards were
            registered).
          - The header tightens its padding so the card stays a
            slim strip when the user shrinks it down to one row.
        Everything else (height: 100 % cascade, flex layout)
        stays identical, so the strip still fills its container
        when there's room. */
    :host([data-mini]) ha-card
    {
        min-height: 90px;
    }

    :host([data-mini]) .header
    {
        padding: 8px 14px 4px 14px;
    }

    .root
    {
        display:        flex;
        flex-direction: column;
        width:          100%;
        height:         100%;
        min-height:     0;
        position:       relative;
        background:     var(--hermes-bg-grad, none);

        --hermes-label-font:
            ui-sans-serif, system-ui, -apple-system, "Segoe UI",
            "Inter", "Helvetica Neue", Arial, sans-serif;
        --hermes-mono-font:
            ui-monospace, SFMono-Regular, "SF Mono", Menlo,
            Consolas, "Liberation Mono", monospace;
    }

    /*  --- DARK theme (default) ---------------------------------- */
    .root.theme-dark
    {
        --hermes-bg-base:        #0a0c10;
        --hermes-bg-grad:        radial-gradient(120% 100% at 60% 0%, #0c0f15 0%, #07090c 100%);
        --hermes-card-inset:     rgba(255, 255, 255, 0.03);
        --hermes-card-vignette:  rgba(0, 0, 0, 0.6);
        --hermes-fg:             #e7ecf3;
        --hermes-fg-dim:         #9aa3b2;
        --hermes-fg-mute:        #5a6273;
        --hermes-rule:           rgba(255, 255, 255, 0.06);
        --hermes-rule-strong:    rgba(255, 255, 255, 0.12);
        --hermes-divider-tint:   rgba(255, 255, 255, 0.12);
        --hermes-tooltip-bg:     rgba(16, 19, 26, 0.92);
        --hermes-tooltip-bd:     rgba(255, 255, 255, 0.08);
        --hermes-scrollbar:      rgba(255, 255, 255, 0.14);
        --hermes-scrollbar-hov:  rgba(255, 255, 255, 0.24);
        --hermes-midline:        rgba(255, 255, 255, 0.05);
        --hermes-canvas-text:    rgba(255, 255, 255, 0.62);
        --hermes-canvas-mute:    rgba(255, 255, 255, 0.38);
    }

    /*  --- LIGHT theme ------------------------------------------- */
    .root.theme-light
    {
        --hermes-bg-base:        #f3f5f9;
        --hermes-bg-grad:        radial-gradient(120% 100% at 60% 0%, #ffffff 0%, #eef1f6 100%);
        --hermes-card-inset:     rgba(0, 0, 0, 0.04);
        --hermes-card-vignette:  rgba(0, 0, 0, 0.06);
        --hermes-fg:             #1a1d23;
        --hermes-fg-dim:         #4a5160;
        --hermes-fg-mute:        #8b94a5;
        --hermes-rule:           rgba(0, 0, 0, 0.05);
        --hermes-rule-strong:    rgba(0, 0, 0, 0.10);
        --hermes-divider-tint:   rgba(0, 0, 0, 0.10);
        --hermes-tooltip-bg:     rgba(255, 255, 255, 0.96);
        --hermes-tooltip-bd:     rgba(0, 0, 0, 0.08);
        --hermes-scrollbar:      rgba(0, 0, 0, 0.18);
        --hermes-scrollbar-hov:  rgba(0, 0, 0, 0.32);
        --hermes-midline:        rgba(0, 0, 0, 0.05);
        --hermes-canvas-text:    rgba(0, 0, 0, 0.70);
        --hermes-canvas-mute:    rgba(0, 0, 0, 0.42);
    }

    .header
    {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 18px 8px 18px;
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
        gap: 4px 10px;
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

    /*  Global timeline strip. In normal layout it has a fixed
        height set inline by the renderer; in mini-card mode it
        takes the whole available space (the stage is gone). */
    .global
    {
        flex: 0 0 auto;
        position: relative;
        width: 100%;
        overflow: hidden;
    }

    .global.mini
    {
        flex: 1 1 auto;
        /*  Reserve a baseline so the canvas always has somewhere
            to paint, even when ha-card's parent gives us zero
            height (e.g. inside the HA card-picker preview cell
            before it has measured us). */
        min-height: 50px;
    }

    .root.mini .header
    {
        padding-bottom: 4px;
    }

    .global canvas
    {
        display: block;
        width: 100%;
        height: 100%;
        position: absolute;
        inset: 0;
    }

    /*  Play / pause button centred on the global strip. Sits on
        top of the canvas, but only fades in when the user hovers
        the strip (or when the timeline is currently paused, so
        the user always has a clear way back to live). Themed via
        the existing CSS variables so the disc stays legible on
        both light and dark surfaces. */
    .play-pause-btn
    {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 32px;
        height: 32px;
        padding: 0;
        border-radius: 50%;
        border: 1px solid var(--hermes-rule-strong);
        background: var(--hermes-tooltip-bg);
        color: var(--hermes-fg);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font: inherit;
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(0, 0, 0, 0.08);

        /*  Hidden until the user enters the strip. pointer-
            events:none keeps the hit-test silent while fading
            so accidental clicks land on the canvas underneath
            instead of an invisible target. */
        opacity: 0;
        pointer-events: none;
        transition:
            opacity 180ms ease,
            transform 120ms ease,
            background-color 120ms ease,
            border-color 120ms ease;
        z-index: 4;
    }

    /*  Reveal triggers:
          - user is hovering the global strip,
          - the button has keyboard focus,
          - the timeline is paused (so the user can always find
            the resume action without having to remember where to
            mouse). */
    .global:hover .play-pause-btn,
    .play-pause-btn:focus-visible,
    .play-pause-btn.is-paused
    {
        opacity: 1;
        pointer-events: auto;
    }

    .play-pause-btn:hover
    {
        transform: translate(-50%, -50%) scale(1.06);
        border-color: var(--hermes-fg-dim);
    }

    .play-pause-btn:focus-visible
    {
        outline: 2px solid var(--hermes-fg-dim);
        outline-offset: 2px;
    }

    .play-pause-btn svg
    {
        width: 16px;
        height: 16px;
        display: block;
    }

    /*  Soft pulse on the paused state so the user notices the
        timeline is frozen even when no pings are flowing. */
    .play-pause-btn.is-paused
    {
        animation: hermes-pause-pulse 2s ease-in-out infinite;
    }

    @keyframes hermes-pause-pulse
    {
        0%, 100% { box-shadow: 0 4px 12px rgba(0,0,0,0.25), 0 0 0 0   var(--hermes-rule-strong); }
        50%      { box-shadow: 0 4px 12px rgba(0,0,0,0.25), 0 0 0 6px transparent; }
    }

    .divider
    {
        flex: 0 0 auto;
        height: 1px;
        background: linear-gradient(
            to right,
            transparent 0%,
            var(--hermes-divider-tint) 16%,
            var(--hermes-divider-tint) 84%,
            transparent 100%
        );
        margin: 0 12px;
    }

    /*  Main stage.
        Two stacked layers, both filling the stage box:
          - .stage-canvas-layer: an absolutely-positioned canvas,
            painted to the visible viewport, with pointer-events:
            none so it never swallows scroll wheel / touch / mouse
            events headed for the layer above.
          - .stage-scroll-layer: an overlay scroll container with
            overflow-y:auto, holding a single tall spacer that
            drives the scrollbar. All pointer events land here;
            the card translates the scrollTop into a render
            offset on the canvas below.
        This split is what the previous sticky-canvas approach
        was simulating, with none of the platform quirks that
        sometimes prevented vertical wheeling from kicking the
        scroll container. */
    .stage
    {
        flex: 1 1 auto;
        position: relative;
        width: 100%;
        min-height: 0;
    }

    .stage-canvas-layer
    {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    .stage-canvas-layer canvas
    {
        display: block;
        width: 100%;
        height: 100%;
    }

    .stage-scroll-layer
    {
        position: absolute;
        inset: 0;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-color: var(--hermes-scrollbar) transparent;
        /*  Tell touch UAs that vertical pan is the only gesture
            we want; the canvas hit-tests itself for hover, no
            need for pinch-zoom / horizontal swipe defaults. */
        touch-action: pan-y;
    }

    .stage-scroll-layer::-webkit-scrollbar
    {
        width: 8px;
    }

    .stage-scroll-layer::-webkit-scrollbar-track
    {
        background: transparent;
    }

    .stage-scroll-layer::-webkit-scrollbar-thumb
    {
        background: var(--hermes-scrollbar);
        border-radius: 6px;
    }

    .stage-scroll-layer::-webkit-scrollbar-thumb:hover
    {
        background: var(--hermes-scrollbar-hov);
    }

    .stage-spacer
    {
        width: 100%;
        /*  Inline height set by the renderer. The 1px floor
            avoids the scrollbar flashing when there are no
            lanes yet. */
        height: 1px;
    }

    .tooltip
    {
        position: absolute;
        z-index: 5;
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
        opacity: 0;
        transition: opacity 90ms ease-out;
    }

    .tooltip.visible
    {
        opacity: 1;
    }

    /*  Mini-card tooltip.
        Switches the bubble to position:fixed so it can escape
        ha-card's overflow:hidden (mini cards are thin strips
        with very little vertical room - a normal absolute bubble
        would get clipped above the strip). Content is also
        slimmed down to a single name + value pair via a render
        branch in hermes-card.ts, so the bubble doesn't need to
        be tall in the first place. */
    .tooltip.mini
    {
        position: fixed;
        min-width: 100px;
        max-width: 240px;
        padding: 6px 9px;
    }

    .tooltip.mini .tt-name
    {
        font-size: 12px;
        margin-bottom: 1px;
        -webkit-line-clamp: 1;
    }

    .tooltip.mini .tt-row
    {
        font-size: 10.5px;
    }

    /*  Tooltip placement variants. The transform is what positions
        the bubble relative to the (x, y) anchor: above the ping
        by default, below it when the anchor is too close to the
        top of the card. */
    .tooltip.above
    {
        transform: translate(-50%, calc(-100% - 10px));
    }

    .tooltip.below
    {
        transform: translate(-50%, 14px);
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
        left: calc(50% + var(--hermes-arrow-offset, 0px));
        transform: translateX(-50%) rotate(45deg);
        width: 8px;
        height: 8px;
        background: var(--hermes-tooltip-bg);
    }

    .tooltip.above .tt-arrow
    {
        bottom: -5px;
        border-right: 1px solid var(--hermes-tooltip-bd);
        border-bottom: 1px solid var(--hermes-tooltip-bd);
    }

    .tooltip.below .tt-arrow
    {
        top: -5px;
        border-left: 1px solid var(--hermes-tooltip-bd);
        border-top:  1px solid var(--hermes-tooltip-bd);
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
`;
const de = {
  cardName: "Hermes",
  cardDescription: "Echtzeit-Aktivitätspuls der Entitäten",
  miniCardName: "Hermes (Mini)",
  miniCardDescription: "Kompakter Aktivitätsstreifen der Entitäten",
  entity: "Entität",
  entities: "Entitäten",
  emptyTitle: "Höre zu…",
  emptyHint: "Für jede Zustandsänderung erscheint eine Kugel.",
  tooltipValue: "Wert",
  tooltipPrevious: "Vorheriger",
  tooltipAgo: "Gesehen",
  tooltipCount: "Änderungen",
  justNow: "gerade eben",
  unitSec: "s",
  unitMin: "Min.",
  unitHour: "Std.",
  editorAppearanceSection: "Erscheinungsbild",
  editorTimelineSection: "Zeitachsen",
  editorFilterSection: "Entitäten",
  editorTitle: "Titel",
  editorCardTheme: "Design",
  editorThemeLight: "Hell",
  editorThemeDark: "Dunkel",
  editorTimespan: "Hauptfenster (s)",
  editorGlobalTimespan: "Globaler Streifen (s)",
  editorGlobalHeight: "Höhe des globalen Streifens (px)",
  editorShowGlobal: "Globalen Streifen zeigen",
  editorLabelWidth: "Namensspalte (px)",
  editorValueWidth: "Wertspalte (px)",
  editorShowLegend: "Legende zeigen",
  editorShowLastValue: "Letzten Wert zeigen",
  editorMaxPings: "Max. Pings",
  editorEntities: "Entitäten (eine pro Zeile, * und ? erlaubt)",
  editorEntitiesHint: "Leer lassen, um alle Entitäten der unten erlaubten Domains zu beobachten.",
  editorIncludeDomains: "Erlaubte Domains (kommagetrennt)",
  editorExcludeEntities: "Ausgeschlossene Entitäten (eine pro Zeile)",
  editorExcludeDomains: "Ausgeschlossene Domains (kommagetrennt)",
  editorIgnoreUnavailable: "Nicht verfügbar / unbekannt ignorieren",
  yes: "Ein",
  no: "Aus",
  actionPlay: "Wiedergabe",
  actionPause: "Pause"
};
const en = {
  cardName: "Hermes",
  cardDescription: "Real-time entity activity pulse",
  miniCardName: "Hermes (mini)",
  miniCardDescription: "Compact entity activity strip",
  entity: "entity",
  entities: "entities",
  emptyTitle: "Listening…",
  emptyHint: "A sphere will appear for every entity state change.",
  tooltipValue: "Value",
  tooltipPrevious: "Previous",
  tooltipAgo: "Seen",
  tooltipCount: "Changes",
  justNow: "just now",
  unitSec: "s ago",
  unitMin: "min ago",
  unitHour: "h ago",
  editorAppearanceSection: "Appearance",
  editorTimelineSection: "Timelines",
  editorFilterSection: "Entities",
  editorTitle: "Title",
  editorCardTheme: "Theme",
  editorThemeLight: "Light",
  editorThemeDark: "Dark",
  editorTimespan: "Main window (s)",
  editorGlobalTimespan: "Global strip window (s)",
  editorGlobalHeight: "Global strip height (px)",
  editorShowGlobal: "Show global strip",
  editorLabelWidth: "Name column (px)",
  editorValueWidth: "Value column (px)",
  editorShowLegend: "Show legend",
  editorShowLastValue: "Show last value",
  editorMaxPings: "Max pings",
  editorEntities: "Entities (one per line, supports * and ?)",
  editorEntitiesHint: "Leave empty to track all entities in the allowed domains below.",
  editorIncludeDomains: "Allowed domains (comma-separated)",
  editorExcludeEntities: "Excluded entities (one per line)",
  editorExcludeDomains: "Excluded domains (comma-separated)",
  editorIgnoreUnavailable: "Ignore unavailable / unknown",
  yes: "On",
  no: "Off",
  actionPlay: "Play",
  actionPause: "Pause"
};
const es = {
  cardName: "Hermes",
  cardDescription: "Pulso de actividad de entidades en tiempo real",
  miniCardName: "Hermes (mini)",
  miniCardDescription: "Banda compacta de actividad de entidades",
  entity: "entidad",
  entities: "entidades",
  emptyTitle: "Escuchando…",
  emptyHint: "Aparecerá una esfera por cada cambio de estado de una entidad.",
  tooltipValue: "Valor",
  tooltipPrevious: "Anterior",
  tooltipAgo: "Visto",
  tooltipCount: "Cambios",
  justNow: "ahora mismo",
  unitSec: "s",
  unitMin: "min",
  unitHour: "h",
  editorAppearanceSection: "Apariencia",
  editorTimelineSection: "Cronologías",
  editorFilterSection: "Entidades",
  editorTitle: "Título",
  editorCardTheme: "Tema",
  editorThemeLight: "Claro",
  editorThemeDark: "Oscuro",
  editorTimespan: "Ventana principal (s)",
  editorGlobalTimespan: "Ventana de la banda global (s)",
  editorGlobalHeight: "Altura de la banda global (px)",
  editorShowGlobal: "Mostrar banda global",
  editorLabelWidth: "Columna nombre (px)",
  editorValueWidth: "Columna valor (px)",
  editorShowLegend: "Mostrar leyenda",
  editorShowLastValue: "Mostrar último valor",
  editorMaxPings: "Máx. pings",
  editorEntities: "Entidades (una por línea, * y ? admitidos)",
  editorEntitiesHint: "Deja vacío para seguir todas las entidades de los dominios permitidos abajo.",
  editorIncludeDomains: "Dominios permitidos (separados por comas)",
  editorExcludeEntities: "Entidades excluidas (una por línea)",
  editorExcludeDomains: "Dominios excluidos (separados por comas)",
  editorIgnoreUnavailable: "Ignorar no disponible / desconocido",
  yes: "Sí",
  no: "No",
  actionPlay: "Reproducir",
  actionPause: "Pausa"
};
const fr = {
  cardName: "Hermes",
  cardDescription: "Pouls d'activité des entités en temps réel",
  miniCardName: "Hermes (mini)",
  miniCardDescription: "Bande compacte d'activité des entités",
  entity: "entité",
  entities: "entités",
  emptyTitle: "À l'écoute…",
  emptyHint: "Une sphère apparaîtra pour chaque changement d'état d'entité.",
  tooltipValue: "Valeur",
  tooltipPrevious: "Précédente",
  tooltipAgo: "Vu",
  tooltipCount: "Changements",
  justNow: "à l'instant",
  unitSec: "s",
  unitMin: "min",
  unitHour: "h",
  editorAppearanceSection: "Apparence",
  editorTimelineSection: "Chronologies",
  editorFilterSection: "Entités",
  editorTitle: "Titre",
  editorCardTheme: "Thème",
  editorThemeLight: "Clair",
  editorThemeDark: "Sombre",
  editorTimespan: "Fenêtre principale (s)",
  editorGlobalTimespan: "Fenêtre de la bande globale (s)",
  editorGlobalHeight: "Hauteur de la bande globale (px)",
  editorShowGlobal: "Afficher la bande globale",
  editorLabelWidth: "Colonne nom (px)",
  editorValueWidth: "Colonne valeur (px)",
  editorShowLegend: "Afficher la légende",
  editorShowLastValue: "Afficher la dernière valeur",
  editorMaxPings: "Pings retenus (max)",
  editorEntities: "Entités (une par ligne, * et ? acceptés)",
  editorEntitiesHint: "Laissez vide pour suivre toutes les entités des domaines autorisés ci-dessous.",
  editorIncludeDomains: "Domaines autorisés (séparés par des virgules)",
  editorExcludeEntities: "Entités exclues (une par ligne)",
  editorExcludeDomains: "Domaines exclus (séparés par des virgules)",
  editorIgnoreUnavailable: "Ignorer indisponible / inconnu",
  yes: "Oui",
  no: "Non",
  actionPlay: "Lecture",
  actionPause: "Pause"
};
const it = {
  cardName: "Hermes",
  cardDescription: "Polso d'attività delle entità in tempo reale",
  miniCardName: "Hermes (mini)",
  miniCardDescription: "Striscia compatta d'attività delle entità",
  entity: "entità",
  entities: "entità",
  emptyTitle: "In ascolto…",
  emptyHint: "Apparirà una sfera per ogni cambio di stato di un'entità.",
  tooltipValue: "Valore",
  tooltipPrevious: "Precedente",
  tooltipAgo: "Visto",
  tooltipCount: "Cambi",
  justNow: "proprio ora",
  unitSec: "s fa",
  unitMin: "min fa",
  unitHour: "h fa",
  editorAppearanceSection: "Aspetto",
  editorTimelineSection: "Cronologie",
  editorFilterSection: "Entità",
  editorTitle: "Titolo",
  editorCardTheme: "Tema",
  editorThemeLight: "Chiaro",
  editorThemeDark: "Scuro",
  editorTimespan: "Finestra principale (s)",
  editorGlobalTimespan: "Finestra della striscia globale (s)",
  editorGlobalHeight: "Altezza della striscia globale (px)",
  editorShowGlobal: "Mostra striscia globale",
  editorLabelWidth: "Colonna nome (px)",
  editorValueWidth: "Colonna valore (px)",
  editorShowLegend: "Mostra legenda",
  editorShowLastValue: "Mostra ultimo valore",
  editorMaxPings: "Max ping",
  editorEntities: "Entità (una per riga, * e ? accettati)",
  editorEntitiesHint: "Lascia vuoto per seguire tutte le entità dei domini consentiti qui sotto.",
  editorIncludeDomains: "Domini consentiti (separati da virgola)",
  editorExcludeEntities: "Entità escluse (una per riga)",
  editorExcludeDomains: "Domini esclusi (separati da virgola)",
  editorIgnoreUnavailable: "Ignora non disponibile / sconosciuto",
  yes: "On",
  no: "Off",
  actionPlay: "Riproduci",
  actionPause: "Pausa"
};
const nl = {
  cardName: "Hermes",
  cardDescription: "Realtime activiteitsritme van entiteiten",
  miniCardName: "Hermes (mini)",
  miniCardDescription: "Compacte activiteitsstrip van entiteiten",
  entity: "entiteit",
  entities: "entiteiten",
  emptyTitle: "Luisteren…",
  emptyHint: "Voor elke statuswijziging van een entiteit verschijnt een bol.",
  tooltipValue: "Waarde",
  tooltipPrevious: "Vorige",
  tooltipAgo: "Gezien",
  tooltipCount: "Wijzigingen",
  justNow: "zojuist",
  unitSec: "s geleden",
  unitMin: "min geleden",
  unitHour: "u geleden",
  editorAppearanceSection: "Uiterlijk",
  editorTimelineSection: "Tijdlijnen",
  editorFilterSection: "Entiteiten",
  editorTitle: "Titel",
  editorCardTheme: "Thema",
  editorThemeLight: "Licht",
  editorThemeDark: "Donker",
  editorTimespan: "Hoofdvenster (s)",
  editorGlobalTimespan: "Globaal venster (s)",
  editorGlobalHeight: "Hoogte globale strip (px)",
  editorShowGlobal: "Toon globale strip",
  editorLabelWidth: "Naamkolom (px)",
  editorValueWidth: "Waardekolom (px)",
  editorShowLegend: "Toon legenda",
  editorShowLastValue: "Toon laatste waarde",
  editorMaxPings: "Max. pings",
  editorEntities: "Entiteiten (één per regel, * en ? toegestaan)",
  editorEntitiesHint: "Laat leeg om alle entiteiten van de toegestane domeinen hieronder te volgen.",
  editorIncludeDomains: "Toegestane domeinen (komma-gescheiden)",
  editorExcludeEntities: "Uitgesloten entiteiten (één per regel)",
  editorExcludeDomains: "Uitgesloten domeinen (komma-gescheiden)",
  editorIgnoreUnavailable: "Niet beschikbaar / onbekend negeren",
  yes: "Aan",
  no: "Uit",
  actionPlay: "Afspelen",
  actionPause: "Pauze"
};
const pt = {
  cardName: "Hermes",
  cardDescription: "Pulso de atividade das entidades em tempo real",
  miniCardName: "Hermes (mini)",
  miniCardDescription: "Faixa compacta de atividade das entidades",
  entity: "entidade",
  entities: "entidades",
  emptyTitle: "A escutar…",
  emptyHint: "Aparecerá uma esfera por cada mudança de estado de uma entidade.",
  tooltipValue: "Valor",
  tooltipPrevious: "Anterior",
  tooltipAgo: "Visto",
  tooltipCount: "Mudanças",
  justNow: "agora mesmo",
  unitSec: "s atrás",
  unitMin: "min atrás",
  unitHour: "h atrás",
  editorAppearanceSection: "Aparência",
  editorTimelineSection: "Cronologias",
  editorFilterSection: "Entidades",
  editorTitle: "Título",
  editorCardTheme: "Tema",
  editorThemeLight: "Claro",
  editorThemeDark: "Escuro",
  editorTimespan: "Janela principal (s)",
  editorGlobalTimespan: "Janela da faixa global (s)",
  editorGlobalHeight: "Altura da faixa global (px)",
  editorShowGlobal: "Mostrar faixa global",
  editorLabelWidth: "Coluna nome (px)",
  editorValueWidth: "Coluna valor (px)",
  editorShowLegend: "Mostrar legenda",
  editorShowLastValue: "Mostrar último valor",
  editorMaxPings: "Máx. pings",
  editorEntities: "Entidades (uma por linha, * e ? aceites)",
  editorEntitiesHint: "Deixe vazio para acompanhar todas as entidades dos domínios permitidos abaixo.",
  editorIncludeDomains: "Domínios permitidos (separados por vírgula)",
  editorExcludeEntities: "Entidades excluídas (uma por linha)",
  editorExcludeDomains: "Domínios excluídos (separados por vírgula)",
  editorIgnoreUnavailable: "Ignorar indisponível / desconhecido",
  yes: "Sim",
  no: "Não",
  actionPlay: "Reproduzir",
  actionPause: "Pausa"
};
const TABLE = {
  de,
  en,
  es,
  fr,
  it,
  nl,
  pt
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
    const type = config?.type === "custom:hermes-mini-card" ? "custom:hermes-mini-card" : "custom:hermes-card";
    this._config = { ...config, type };
  }
  get _isMini() {
    return this._config.type === "custom:hermes-mini-card";
  }
  render() {
    const c2 = this._config;
    const i2 = this._i18n;
    const mini = this._isMini;
    const domainsCsv = (c2.include_domains ?? [...DEFAULT_INCLUDE_DOMAINS]).join(", ");
    const excludeDomainsCsv = (c2.exclude_domains ?? []).join(", ");
    const entitiesText = (c2.entities ?? []).join("\n");
    const excludeEntitiesText = (c2.exclude_entities ?? []).join("\n");
    return b`
            <div class="editor">
                <div class="section-title">${i2.editorAppearanceSection}</div>

                <div class="field">
                    <span class="label">${i2.editorTitle}</span>
                    <input
                        type="text"
                        .value=${c2.title ?? "Activity"}
                        @input=${(e2) => this._update("title", e2.target.value)}
                    />
                </div>

                <div class="field">
                    <span class="label">${i2.editorCardTheme}</span>
                    <div class="segmented-toggle">
                        <button
                            type="button"
                            class="seg-option ${(c2.card_theme ?? "dark") === "light" ? "active" : ""}"
                            @click=${() => this._update("card_theme", "light")}
                        >${i2.editorThemeLight}</button>
                        <button
                            type="button"
                            class="seg-option ${(c2.card_theme ?? "dark") === "dark" ? "active" : ""}"
                            @click=${() => this._update("card_theme", "dark")}
                        >${i2.editorThemeDark}</button>
                    </div>
                </div>

                ${this._segmentedToggle(i2.editorShowLegend, "show_legend", c2.show_legend !== false)}

                <div class="section-title">${i2.editorTimelineSection}</div>

                <div class="field">
                    <span class="label">${i2.editorGlobalTimespan}</span>
                    <input
                        type="number"
                        min="5"
                        max="3600"
                        step="5"
                        .value=${String(c2.global_timespan_seconds ?? (mini ? 30 : 60))}
                        @input=${(e2) => this._updateNum("global_timespan_seconds", e2.target.value)}
                    />
                </div>

                ${mini ? A : b`
                    <div class="field">
                        <span class="label">${i2.editorGlobalHeight}</span>
                        <input
                            type="number"
                            min="32"
                            max="200"
                            step="4"
                            .value=${String(c2.global_height ?? 72)}
                            @input=${(e2) => this._updateNum("global_height", e2.target.value)}
                        />
                    </div>

                    ${this._segmentedToggle(i2.editorShowGlobal, "show_global", c2.show_global !== false)}

                    <div class="field">
                        <span class="label">${i2.editorTimespan}</span>
                        <input
                            type="number"
                            min="10"
                            max="86400"
                            step="10"
                            .value=${String(c2.timespan_seconds ?? 300)}
                            @input=${(e2) => this._updateNum("timespan_seconds", e2.target.value)}
                        />
                    </div>

                    <div class="field">
                        <span class="label">${i2.editorLabelWidth}</span>
                        <input
                            type="number"
                            min="0"
                            max="320"
                            step="4"
                            .value=${String(c2.label_width ?? 150)}
                            @input=${(e2) => this._updateNum("label_width", e2.target.value)}
                        />
                    </div>

                    <div class="field">
                        <span class="label">${i2.editorValueWidth}</span>
                        <input
                            type="number"
                            min="0"
                            max="200"
                            step="4"
                            .value=${String(c2.value_width ?? 64)}
                            @input=${(e2) => this._updateNum("value_width", e2.target.value)}
                        />
                    </div>

                    ${this._segmentedToggle(i2.editorShowLastValue, "show_last_value", c2.show_last_value !== false)}
                `}

                <div class="section-title">${i2.editorFilterSection}</div>

                <div class="field field-block">
                    <span class="label">${i2.editorEntities}</span>
                    <textarea
                        spellcheck="false"
                        @input=${(e2) => this._updateList("entities", e2.target.value, "\n")}
                    >${entitiesText}</textarea>
                    <div class="hint">${i2.editorEntitiesHint}</div>
                </div>

                <div class="field field-block">
                    <span class="label">${i2.editorIncludeDomains}</span>
                    <input
                        type="text"
                        style="width: 100%; box-sizing: border-box;"
                        .value=${domainsCsv}
                        @input=${(e2) => this._updateList("include_domains", e2.target.value, ",")}
                    />
                </div>

                <div class="field field-block">
                    <span class="label">${i2.editorExcludeEntities}</span>
                    <textarea
                        spellcheck="false"
                        @input=${(e2) => this._updateList("exclude_entities", e2.target.value, "\n")}
                    >${excludeEntitiesText}</textarea>
                </div>

                <div class="field field-block">
                    <span class="label">${i2.editorExcludeDomains}</span>
                    <input
                        type="text"
                        style="width: 100%; box-sizing: border-box;"
                        .value=${excludeDomainsCsv}
                        @input=${(e2) => this._updateList("exclude_domains", e2.target.value, ",")}
                    />
                </div>

                ${this._segmentedToggle(i2.editorIgnoreUnavailable, "ignore_unavailable", c2.ignore_unavailable !== false)}

                <div class="field">
                    <span class="label">${i2.editorMaxPings}</span>
                    <input
                        type="number"
                        min="50"
                        max="20000"
                        step="50"
                        .value=${String(c2.max_pings ?? 2e3)}
                        @input=${(e2) => this._updateNum("max_pings", e2.target.value)}
                    />
                </div>
            </div>
        `;
  }
  _segmentedToggle(label, key, current) {
    const i2 = this._i18n;
    return b`
            <div class="field">
                <span class="label">${label}</span>
                <div class="segmented-toggle">
                    <button
                        type="button"
                        class="seg-option ${current ? "active" : ""}"
                        @click=${() => this._update(key, true)}
                    >${i2.yes}</button>
                    <button
                        type="button"
                        class="seg-option ${!current ? "active" : ""}"
                        @click=${() => this._update(key, false)}
                    >${i2.no}</button>
                </div>
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
if (!window.customCards.some((c2) => c2.type === "hermes-mini-card")) {
  window.customCards.push(
    {
      type: "hermes-mini-card",
      name: _bootI18n.miniCardName,
      description: _bootI18n.miniCardDescription,
      preview: true
    }
  );
}
{
  const flagKey = "__hermesBannerPrinted";
  const w = window;
  if (!w[flagKey]) {
    w[flagKey] = true;
    const labelStyle = "background:#8b5cf6;color:#1f2937;padding:2px 8px;border-radius:4px 0 0 4px;font-weight:bold;";
    const versionStyle = "background:#1f2937;color:#8b5cf6;padding:2px 8px;border-radius:0 4px 4px 0;font-weight:bold;";
    console.info(
      `%c❋ HERMES%c v${HERMES_VERSION}`,
      labelStyle,
      versionStyle
    );
    console.info(
      `%c❋ HERMES%c watching every entity state change on this dashboard`,
      labelStyle,
      "color:#6b7280;font-style:italic;"
    );
  }
}
const EMPTY_TOOLTIP = {
  visible: false,
  x: 0,
  y: 0,
  place: "above",
  arrowOffset: 0,
  pingId: 0,
  showCount: false,
  name: "",
  entityId: "",
  value: "",
  previous: "",
  ago: "",
  count: 0,
  color: "#94A3B8"
};
const STAGE_PAD_TOP = 6;
const STAGE_PAD_BOTTOM = 6;
const STAGE_PAD_RIGHT = 18;
const LANE_PITCH = 30;
const LANE_INNER = 26;
const HIT_RADIUS_PAD = 6;
const FADE_TAIL_FRAC = 0.18;
const GLOBAL_PAD_X = 18;
const GLOBAL_INNER_PAD = 8;
const CATCH_UP_SPEED = 6;
const LIVE_EPSILON_MS = 60;
const TOOLTIP_HALF_W = 110;
const TOOLTIP_H = 110;
const TOOLTIP_MARGIN = 8;
const TOOLTIP_HALF_W_MINI = 90;
const TOOLTIP_H_MINI = 58;
const DEFAULT_PALETTE = {
  text: "rgba(255,255,255,0.62)",
  mute: "rgba(255,255,255,0.38)",
  midline: "rgba(255,255,255,0.05)"
};
const LABEL_DOT_X = 12;
const LABEL_DOT_R = 3.2;
const LABEL_TEXT_START = 22;
const LABEL_COL_GAP = 10;
const VALUE_RIGHT_PAD = 10;
let HermesCard = class extends i {
  constructor() {
    super(...arguments);
    this._config = resolveConfig({});
    this._tooltip = EMPTY_TOOLTIP;
    this._entityCount = 0;
    this._i18n = _bootI18n;
    this._paused = false;
    this._renderNow = Date.now();
    this._lastRafTime = 0;
    this.engine = null;
    this.engineUnsubscribe = null;
    this.rootEl = null;
    this.stageEl = null;
    this.stageCanvas = null;
    this.stageCtx = null;
    this.scrollEl = null;
    this.globalEl = null;
    this.globalCanvas = null;
    this.globalCtx = null;
    this.spacerEl = null;
    this.resizeObserver = null;
    this.rafHandle = 0;
    this.dirty = true;
    this.stageMouse = { x: -1, y: -1 };
    this.globalMouse = { x: -1, y: -1 };
    this.stageScrollY = 0;
    this.stageW = 0;
    this.stageH = 0;
    this.globalW = 0;
    this.globalH = 0;
    this.dpr = 1;
    this.handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      this.dpr = dpr;
      if (this.stageEl && this.stageCanvas) {
        const stageRect = this.stageEl.getBoundingClientRect();
        const sw = Math.max(0, Math.floor(stageRect.width));
        const sh = Math.max(0, Math.floor(stageRect.height));
        if (sw !== this.stageW || sh !== this.stageH) {
          this.stageW = sw;
          this.stageH = sh;
          this.stageCanvas.width = Math.max(1, Math.floor(sw * dpr));
          this.stageCanvas.height = Math.max(1, Math.floor(sh * dpr));
          this.stageCanvas.style.width = `${sw}px`;
          this.stageCanvas.style.height = `${sh}px`;
        }
      }
      if (this.globalCanvas && this.globalEl) {
        const grect = this.globalEl.getBoundingClientRect();
        const gw = Math.max(0, Math.floor(grect.width));
        const gh = Math.max(0, Math.floor(grect.height));
        if (gw !== this.globalW || gh !== this.globalH) {
          this.globalW = gw;
          this.globalH = gh;
          this.globalCanvas.width = Math.max(1, Math.floor(gw * dpr));
          this.globalCanvas.height = Math.max(1, Math.floor(gh * dpr));
          this.globalCanvas.style.width = `${gw}px`;
          this.globalCanvas.style.height = `${gh}px`;
        }
      }
      this.dirty = true;
    };
    this.handleScroll = () => {
      if (!this.scrollEl) return;
      this.stageScrollY = this.scrollEl.scrollTop;
      this.dirty = true;
    };
    this.handleStageMouseMove = (ev) => {
      const target = this.stageCanvas ?? this.scrollEl;
      if (!target) return;
      const r2 = target.getBoundingClientRect();
      this.stageMouse = { x: ev.clientX - r2.left, y: ev.clientY - r2.top };
      this.dirty = true;
    };
    this.handleStageMouseLeave = () => {
      this.stageMouse = { x: -1, y: -1 };
      this.maybeHideTooltip("stage");
      this.dirty = true;
    };
    this.handleStageTouch = (ev) => {
      if (!ev.touches.length) return;
      const target = this.stageCanvas ?? this.scrollEl;
      if (!target) return;
      const t2 = ev.touches[0];
      const r2 = target.getBoundingClientRect();
      this.stageMouse = { x: t2.clientX - r2.left, y: t2.clientY - r2.top };
      this.dirty = true;
    };
    this.handleGlobalMouseMove = (ev) => {
      if (!this.globalCanvas) return;
      const r2 = this.globalCanvas.getBoundingClientRect();
      this.globalMouse = { x: ev.clientX - r2.left, y: ev.clientY - r2.top };
      this.dirty = true;
    };
    this.handleGlobalMouseLeave = () => {
      this.globalMouse = { x: -1, y: -1 };
      this.maybeHideTooltip("global");
      this.dirty = true;
    };
    this.handleGlobalTouch = (ev) => {
      if (!ev.touches.length || !this.globalCanvas) return;
      const t2 = ev.touches[0];
      const r2 = this.globalCanvas.getBoundingClientRect();
      this.globalMouse = { x: t2.clientX - r2.left, y: t2.clientY - r2.top };
      this.dirty = true;
    };
    this.togglePause = (ev) => {
      ev?.stopPropagation();
      this._paused = !this._paused;
      if (this._paused) {
        this._renderNow = Date.now();
      }
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
  //Stub config for the mini variant. Surfaced through
  //HermesMiniCard.getStubConfig() so the HA card picker
  //preview matches what the user will actually paint. Public
  //so the subclass static can call it without going through
  //a cast.
  static miniStubConfig() {
    return {
      type: "custom:hermes-mini-card",
      title: "Activity",
      global_timespan_seconds: 30
    };
  }
  setConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error("Invalid configuration");
    }
    const resolved = resolveConfig(config);
    const engineCfg = {
      timespan_seconds: Math.max(resolved.timespanSeconds, resolved.globalTimespanSeconds),
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
  //Masonry sizing. 1 unit ≈ 50 px → 6 ≈ 300 px for the full
  //card, 2 ≈ 100 px for the mini variant.
  getCardSize() {
    return this.isMini ? 2 : 6;
  }
  //Sections grid sizing. 1 row ≈ 56 px. The full card defaults
  //to 6 rows / full width; the mini variant collapses to a
  //2-row strip with the same width budget.
  getGridOptions() {
    if (this.isMini) {
      return {
        rows: 2,
        columns: 12,
        min_rows: 1,
        max_rows: 4,
        min_columns: 4,
        max_columns: 12
      };
    }
    return {
      rows: 6,
      columns: 12,
      min_rows: 3,
      max_rows: 24,
      min_columns: 6,
      max_columns: 12
    };
  }
  //----- lifecycle -----
  connectedCallback() {
    super.connectedCallback();
    if (this.isMini) {
      this.setAttribute("data-mini", "");
    }
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
    this.teardownDom();
  }
  updated(changed) {
    super.updated(changed);
    if (!this.rootEl) {
      this.rootEl = this.renderRoot.querySelector(".root");
    }
    if (!this.stageEl) {
      this.stageEl = this.renderRoot.querySelector(".stage");
    }
    if (!this.scrollEl) {
      this.scrollEl = this.renderRoot.querySelector(".stage-scroll-layer");
      if (this.scrollEl) {
        this.scrollEl.addEventListener("scroll", this.handleScroll, { passive: true });
        this.scrollEl.addEventListener("mousemove", this.handleStageMouseMove);
        this.scrollEl.addEventListener("mouseleave", this.handleStageMouseLeave);
        this.scrollEl.addEventListener("touchstart", this.handleStageTouch, { passive: true });
        this.scrollEl.addEventListener("touchmove", this.handleStageTouch, { passive: true });
        this.scrollEl.addEventListener("touchend", this.handleStageMouseLeave);
      }
    }
    if (!this.spacerEl) {
      this.spacerEl = this.renderRoot.querySelector(".stage-spacer");
    }
    if (!this.stageCanvas) {
      this.stageCanvas = this.renderRoot.querySelector(".stage-canvas-layer canvas");
      if (this.stageCanvas) {
        this.stageCtx = this.stageCanvas.getContext("2d", { alpha: true });
      }
    }
    if (!this.globalEl) {
      this.globalEl = this.renderRoot.querySelector(".global");
    }
    if (!this.globalCanvas) {
      this.globalCanvas = this.renderRoot.querySelector(".global canvas");
      if (this.globalCanvas) {
        this.globalCtx = this.globalCanvas.getContext("2d", { alpha: true });
        this.globalCanvas.addEventListener("mousemove", this.handleGlobalMouseMove);
        this.globalCanvas.addEventListener("mouseleave", this.handleGlobalMouseLeave);
        this.globalCanvas.addEventListener("touchstart", this.handleGlobalTouch, { passive: true });
        this.globalCanvas.addEventListener("touchmove", this.handleGlobalTouch, { passive: true });
        this.globalCanvas.addEventListener("touchend", this.handleGlobalMouseLeave);
      }
    }
    if (!this.resizeObserver && this.rootEl) {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(this.rootEl);
      this.handleResize();
    }
    if (changed.has("hass") && this.hass && this.engine) {
      this.engine.bind(this.hass);
    }
  }
  //----- render -----
  //Mini variant flag, dispatched on tag name so a single bundle
  //ships both <hermes-card> and <hermes-mini-card>. Subclassed
  //below at end of file with no extra logic - the override here
  //is enough.
  get isMini() {
    return this.tagName.toLowerCase() === "hermes-mini-card";
  }
  render() {
    const cfg = this._config;
    const tt = this._tooltip;
    const themeClass = cfg.theme === "light" ? "theme-light" : "theme-dark";
    const mini = this.isMini;
    if (mini) {
      return b`
                <ha-card>
                    <div class="root ${themeClass} mini">
                        <div class="header">
                            <div class="title">${cfg.title}</div>
                            <div class="subtitle">
                                ${this._entityCount} ${this._entityCount === 1 ? this._i18n.entity : this._i18n.entities}
                            </div>
                            <div class="spacer"></div>
                            ${cfg.showLegend ? this.renderLegend() : A}
                        </div>
                        <div class="global mini">
                            <canvas></canvas>
                            ${this.renderPlayPauseButton()}
                        </div>
                        ${this._entityCount === 0 ? this.renderEmpty() : A}
                        ${tt.visible ? this.renderTooltip(tt) : A}
                    </div>
                </ha-card>
            `;
    }
    return b`
            <ha-card>
                <div class="root ${themeClass}">
                    <div class="header">
                        <div class="title">${cfg.title}</div>
                        <div class="subtitle">
                            ${this._entityCount} ${this._entityCount === 1 ? this._i18n.entity : this._i18n.entities}
                        </div>
                        <div class="spacer"></div>
                        ${cfg.showLegend ? this.renderLegend() : A}
                    </div>

                    ${cfg.showGlobal ? b`
                        <div class="global" style=${`height:${cfg.globalHeight}px;`}>
                            <canvas></canvas>
                            ${this.renderPlayPauseButton()}
                        </div>
                        <div class="divider"></div>
                    ` : A}

                    <div class="stage">
                        <div class="stage-canvas-layer">
                            <canvas></canvas>
                        </div>
                        <div class="stage-scroll-layer">
                            <div class="stage-spacer"></div>
                        </div>
                    </div>

                    ${this._entityCount === 0 ? this.renderEmpty() : A}
                    ${tt.visible ? this.renderTooltip(tt) : A}
                </div>
            </ha-card>
        `;
  }
  //Inline SVGs for the play / pause icons. Stroked with
  //currentColor so they pick up the theme-aware text colour
  //and stay legible against either background.
  renderPlayPauseButton() {
    const paused = this._paused;
    const aria = paused ? this._i18n.actionPlay : this._i18n.actionPause;
    const icon = paused ? b`<svg viewBox="0 0 24 24" aria-hidden="true">
                       <path d="M8 5 L19 12 L8 19 Z" fill="currentColor" />
                   </svg>` : b`<svg viewBox="0 0 24 24" aria-hidden="true">
                       <rect x="7" y="5" width="3.6" height="14" rx="1" fill="currentColor" />
                       <rect x="13.4" y="5" width="3.6" height="14" rx="1" fill="currentColor" />
                   </svg>`;
    return b`
            <button
                type="button"
                class="play-pause-btn ${paused ? "is-paused" : "is-playing"}"
                title=${aria}
                aria-label=${aria}
                @click=${this.togglePause}
            >${icon}</button>
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
    const placeClass = tt.place === "below" ? "below" : "above";
    const inlineStyle = `left:${tt.x}px;top:${tt.y}px;border-color:${withAlpha(tt.color, 0.4)};--hermes-arrow-offset:${tt.arrowOffset}px;`;
    if (this.isMini) {
      return b`
                <div
                    class="tooltip visible mini ${placeClass}"
                    style=${inlineStyle}
                >
                    <div class="tt-name" style=${`color:${tt.color};`}>${tt.name}</div>
                    <div class="tt-row">
                        <span class="label">${this._i18n.tooltipValue}</span>
                        <span class="value">${tt.value}</span>
                    </div>
                    <div class="tt-arrow"></div>
                </div>
            `;
    }
    return b`
            <div
                class="tooltip visible ${placeClass}"
                style=${inlineStyle}
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
                ${tt.showCount ? b`
                    <div class="tt-row">
                        <span class="label">${this._i18n.tooltipCount}</span>
                        <span class="value">${tt.count}</span>
                    </div>` : A}
                <div class="tt-arrow"></div>
            </div>
        `;
  }
  //----- animation loop -----
  startRaf() {
    if (this.rafHandle !== 0) return;
    this._lastRafTime = performance.now();
    const loop = (t2) => {
      this.rafHandle = requestAnimationFrame(loop);
      this.advanceRenderTime(t2);
      this.paint();
    };
    this.rafHandle = requestAnimationFrame(loop);
  }
  //Per-frame update of the renderer's time cursor. Three
  //regimes:
  //  - paused: cursor frozen. Engine keeps recording, so on
  //    resume we have everything to replay.
  //  - catching up: cursor advances at CATCH_UP_SPEED until
  //    within LIVE_EPSILON_MS of wall-clock time.
  //  - live: cursor snaps to Date.now() each frame, the most
  //    accurate reading and the cheapest path.
  advanceRenderTime(rafTime) {
    const dt = Math.max(0, rafTime - this._lastRafTime);
    this._lastRafTime = rafTime;
    if (this._paused) {
      return;
    }
    const realNow = Date.now();
    const gap = realNow - this._renderNow;
    if (gap <= LIVE_EPSILON_MS) {
      this._renderNow = realNow;
      return;
    }
    const next = this._renderNow + dt * CATCH_UP_SPEED;
    this._renderNow = next >= realNow ? realNow : next;
    this.dirty = true;
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
  teardownDom() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.scrollEl) {
      this.scrollEl.removeEventListener("scroll", this.handleScroll);
      this.scrollEl.removeEventListener("mousemove", this.handleStageMouseMove);
      this.scrollEl.removeEventListener("mouseleave", this.handleStageMouseLeave);
      this.scrollEl.removeEventListener("touchstart", this.handleStageTouch);
      this.scrollEl.removeEventListener("touchmove", this.handleStageTouch);
      this.scrollEl.removeEventListener("touchend", this.handleStageMouseLeave);
    }
    if (this.globalCanvas) {
      this.globalCanvas.removeEventListener("mousemove", this.handleGlobalMouseMove);
      this.globalCanvas.removeEventListener("mouseleave", this.handleGlobalMouseLeave);
      this.globalCanvas.removeEventListener("touchstart", this.handleGlobalTouch);
      this.globalCanvas.removeEventListener("touchmove", this.handleGlobalTouch);
      this.globalCanvas.removeEventListener("touchend", this.handleGlobalMouseLeave);
    }
  }
  //----- paint -----
  //Palette resolved once per frame from the theme CSS variables
  //on .root. The renderer never reads colour-mode constants
  //directly so flipping `card_theme` reskins the canvases on
  //the next paint with no extra plumbing.
  readPalette() {
    if (!this.rootEl) {
      return DEFAULT_PALETTE;
    }
    const cs = getComputedStyle(this.rootEl);
    const get = (name, fallback) => {
      const v2 = cs.getPropertyValue(name).trim();
      return v2.length > 0 ? v2 : fallback;
    };
    return {
      text: get("--hermes-canvas-text", DEFAULT_PALETTE.text),
      mute: get("--hermes-canvas-mute", DEFAULT_PALETTE.mute),
      midline: get("--hermes-midline", DEFAULT_PALETTE.midline)
    };
  }
  paint() {
    if (!this.engine) return;
    const snapshot = this.engine.getSnapshot(this._renderNow);
    const hasMotion = snapshot.pings.length > 0;
    if (!hasMotion && !this.dirty) return;
    this.dirty = false;
    const palette = this.readPalette();
    const totalContentHeight = this.computeTotalContentHeight(snapshot.lanes.length);
    if (this.spacerEl) {
      const spacerH = Math.max(0, totalContentHeight - this.stageH);
      this.spacerEl.style.height = `${Math.max(1, spacerH)}px`;
    }
    let tooltipUpdated = false;
    const stageTooltip = this.paintStage(snapshot, totalContentHeight, palette);
    const globalTooltip = this._config.showGlobal ? this.paintGlobal(snapshot, palette) : null;
    const winner = (this.globalMouse.x >= 0 ? globalTooltip : null) ?? (this.stageMouse.x >= 0 ? stageTooltip : null) ?? null;
    if (winner) {
      this._tooltip = winner;
      tooltipUpdated = true;
    } else if (this._tooltip.visible) {
      this._tooltip = EMPTY_TOOLTIP;
      tooltipUpdated = true;
    }
    if (tooltipUpdated) {
      this.dirty = true;
    }
  }
  computeTotalContentHeight(laneCount) {
    if (laneCount === 0) return 0;
    return STAGE_PAD_TOP + laneCount * LANE_PITCH + STAGE_PAD_BOTTOM;
  }
  paintStage(snapshot, totalContentHeight, palette) {
    const ctx = this.stageCtx;
    if (!ctx || this.stageW === 0 || this.stageH === 0) return null;
    const cfg = this._config;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);
    ctx.clearRect(0, 0, this.stageW, this.stageH);
    const labelW = cfg.labelWidth;
    const valueW = cfg.showLastValue ? cfg.valueWidth : 0;
    const gutterW = labelW > 0 ? labelW + valueW : 0;
    const innerLeft = gutterW;
    const innerRight = this.stageW - STAGE_PAD_RIGHT;
    const innerWidth = Math.max(0, innerRight - innerLeft);
    const scrollY = clamp(
      this.stageScrollY,
      0,
      Math.max(0, totalContentHeight - this.stageH)
    );
    const firstLane = Math.max(
      0,
      Math.floor((scrollY - STAGE_PAD_TOP) / LANE_PITCH)
    );
    const lastLane = Math.min(
      snapshot.lanes.length - 1,
      Math.ceil((scrollY + this.stageH - STAGE_PAD_TOP) / LANE_PITCH)
    );
    const laneY = /* @__PURE__ */ new Map();
    for (let i2 = firstLane; i2 <= lastLane; i2++) {
      const lane = snapshot.lanes[i2];
      if (!lane) continue;
      const y3 = STAGE_PAD_TOP + i2 * LANE_PITCH + LANE_PITCH / 2 - scrollY;
      laneY.set(lane.entityId, { y: y3, color: lane.color, lane });
    }
    this.drawLaneTracks(ctx, laneY, innerLeft, innerRight, labelW, valueW, palette);
    const timespanMs = Math.max(1e3, cfg.timespanSeconds * 1e3);
    const now = snapshot.now;
    let bestHit = null;
    for (let i2 = 0; i2 < snapshot.pings.length; i2++) {
      const p2 = snapshot.pings[i2];
      const slot = laneY.get(p2.entityId);
      if (!slot) continue;
      const ageMs = now - p2.ts;
      const frac = ageMs / timespanMs;
      if (frac < 0 || frac > 1) continue;
      const x2 = innerRight - frac * innerWidth;
      const y3 = slot.y;
      const baseR = LANE_INNER * 0.42;
      const r2 = Math.max(3, baseR * (0.55 + p2.magnitude * 0.65));
      const tailFrac = Math.max(0, (frac - (1 - FADE_TAIL_FRAC)) / FADE_TAIL_FRAC);
      const alpha = 1 - tailFrac;
      this.drawPing(ctx, x2, y3, r2, p2.color, alpha);
      if (this.stageMouse.x >= 0) {
        const dx = x2 - this.stageMouse.x;
        const dy = y3 - this.stageMouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const reach = r2 + HIT_RADIUS_PAD;
        if (dist <= reach && (!bestHit || dist < bestHit.dist)) {
          bestHit = { ping: p2, dist, x: x2, y: y3, r: r2 };
        }
      }
    }
    ctx.restore();
    if (bestHit && this.stageCanvas) {
      return this.buildTooltipFromPing(bestHit.ping, bestHit.x, bestHit.y, this.stageCanvas, false);
    }
    if (gutterW > 0 && this.stageMouse.x >= 0 && this.stageMouse.x < gutterW && this.stageCanvas) {
      for (const slot of laneY.values()) {
        const half = LANE_PITCH / 2;
        if (Math.abs(this.stageMouse.y - slot.y) <= half) {
          return this.buildTooltipFromLane(slot.lane, this.stageMouse.x, slot.y, this.stageCanvas);
        }
      }
    }
    return null;
  }
  paintGlobal(snapshot, palette) {
    const ctx = this.globalCtx;
    if (!ctx || this.globalW === 0 || this.globalH === 0) return null;
    const cfg = this._config;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);
    ctx.clearRect(0, 0, this.globalW, this.globalH);
    ctx.strokeStyle = palette.midline;
    ctx.lineWidth = 1;
    ctx.setLineDash([1.5, 4]);
    ctx.beginPath();
    ctx.moveTo(GLOBAL_PAD_X, this.globalH / 2);
    ctx.lineTo(this.globalW - GLOBAL_PAD_X, this.globalH / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    const innerLeft = GLOBAL_PAD_X;
    const innerRight = this.globalW - GLOBAL_PAD_X;
    const innerWidth = Math.max(0, innerRight - innerLeft);
    const timespanMs = Math.max(500, cfg.globalTimespanSeconds * 1e3);
    const now = snapshot.now;
    const maxR = Math.min(18, (this.globalH - GLOBAL_INNER_PAD * 2) * 0.48);
    const baseR = 2.4;
    const jitterRange = this.globalH / 2 - GLOBAL_INNER_PAD - maxR;
    const centreY = this.globalH / 2;
    let bestHit = null;
    for (let i2 = 0; i2 < snapshot.pings.length; i2++) {
      const p2 = snapshot.pings[i2];
      const ageMs = now - p2.ts;
      const frac = ageMs / timespanMs;
      if (frac < 0 || frac > 1) continue;
      const x2 = innerRight - frac * innerWidth;
      const h2 = entityHash(p2.entityId);
      const y3 = centreY + (h2 - 0.5) * 2 * Math.max(0, jitterRange);
      const r2 = Math.min(maxR, baseR + Math.log2(p2.pingIndex + 1) * 1.85);
      const tailFrac = Math.max(0, (frac - (1 - FADE_TAIL_FRAC)) / FADE_TAIL_FRAC);
      const alpha = 1 - tailFrac;
      this.drawPing(ctx, x2, y3, r2, p2.color, alpha);
      if (this.globalMouse.x >= 0) {
        const dx = x2 - this.globalMouse.x;
        const dy = y3 - this.globalMouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const reach = r2 + HIT_RADIUS_PAD;
        if (dist <= reach && (!bestHit || dist < bestHit.dist)) {
          bestHit = { ping: p2, dist, x: x2, y: y3, r: r2 };
        }
      }
    }
    ctx.restore();
    if (bestHit && this.globalCanvas) {
      return this.buildTooltipFromPing(bestHit.ping, bestHit.x, bestHit.y, this.globalCanvas, true);
    }
    return null;
  }
  drawLaneTracks(ctx, laneY, innerLeft, innerRight, labelW, valueW, palette) {
    const labelFont = "500 11px " + getFontFamily();
    const valueFont = "400 10.5px " + getMonoFamily();
    const dimColor = palette.text;
    const muteColor = palette.mute;
    const nameMaxWidth = labelW > 0 ? Math.max(0, labelW - LABEL_TEXT_START - LABEL_COL_GAP / 2) : 0;
    const valueAnchorX = labelW + valueW - VALUE_RIGHT_PAD;
    const valueMaxWidth = Math.max(0, valueW - LABEL_COL_GAP / 2 - VALUE_RIGHT_PAD);
    ctx.lineWidth = 1;
    for (const slot of laneY.values()) {
      const lane = slot.lane;
      ctx.setLineDash([1.5, 4]);
      ctx.strokeStyle = withAlpha(lane.color, 0.18);
      ctx.beginPath();
      ctx.moveTo(innerLeft, slot.y);
      ctx.lineTo(innerRight, slot.y);
      ctx.stroke();
      ctx.setLineDash([]);
      if (labelW > 0) {
        ctx.fillStyle = lane.color;
        ctx.beginPath();
        ctx.arc(LABEL_DOT_X, slot.y, LABEL_DOT_R, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = dimColor;
        ctx.font = labelFont;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillText(
          clipText(ctx, lane.friendlyName, nameMaxWidth),
          LABEL_TEXT_START,
          slot.y
        );
        if (valueW > 0 && lane.lastState !== null) {
          ctx.fillStyle = muteColor;
          ctx.font = valueFont;
          ctx.textAlign = "right";
          const valueStr = formatLaneValue(lane.lastState, lane.unit);
          ctx.fillText(
            clipText(ctx, valueStr, valueMaxWidth),
            valueAnchorX,
            slot.y
          );
        }
      }
    }
  }
  drawPing(ctx, x2, y3, r2, color, alpha) {
    const gradient = ctx.createRadialGradient(x2, y3, 0, x2, y3, r2);
    gradient.addColorStop(0, withAlpha(color, 0.8 * alpha));
    gradient.addColorStop(0.55, withAlpha(color, 0.55 * alpha));
    gradient.addColorStop(1, withAlpha(color, 0));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x2, y3, r2, 0, Math.PI * 2);
    ctx.fill();
  }
  //Translate a (canvas-local) sphere position into a tooltip
  //placed in .root coordinates so the tooltip element (which
  //lives directly under .root) lines up correctly regardless of
  //which canvas the ping came from. We clamp the bubble's
  //horizontal centre to keep it inside the card, flip it below
  //the sphere when there isn't enough room above, and forward
  //the residual offset so the arrow still points at the ping.
  buildTooltipFromPing(p2, canvasX, canvasY, sourceCanvas, global) {
    const placement = this.computeTooltipPlacement(canvasX, canvasY, sourceCanvas);
    const ageMs = Date.now() - p2.ts;
    return {
      visible: true,
      x: placement.x,
      y: placement.y,
      place: placement.place,
      arrowOffset: placement.arrowOffset,
      pingId: p2.id,
      showCount: global,
      name: p2.friendlyName,
      entityId: p2.entityId,
      value: formatLaneValue(p2.newState, p2.unit),
      previous: p2.oldState !== null ? formatLaneValue(p2.oldState, p2.unit) : "",
      ago: formatAgo(ageMs, this._i18n),
      count: p2.pingIndex,
      color: p2.color
    };
  }
  //Resolve a tooltip's screen position (clamp + above/below
  //flip + arrow offset) once and reuse it for both the ping
  //and the lane variants.
  //
  //In mini-card mode the bounds are the viewport (because the
  //tooltip uses position:fixed to escape ha-card's overflow
  //clip in a strip that's barely tall enough to host it). In
  //the full card we stay in .root coords as before.
  computeTooltipPlacement(canvasX, canvasY, sourceCanvas) {
    const mini = this.isMini;
    const canvasRect = sourceCanvas.getBoundingClientRect();
    const rootRect = this.rootEl?.getBoundingClientRect();
    const halfW = mini ? TOOLTIP_HALF_W_MINI : TOOLTIP_HALF_W;
    const tipH = mini ? TOOLTIP_H_MINI : TOOLTIP_H;
    let rawX;
    let rawY;
    let boundsW;
    let boundsH;
    let topPad;
    let leftPad;
    if (mini) {
      rawX = canvasRect.left + canvasX;
      rawY = canvasRect.top + canvasY;
      boundsW = window.innerWidth;
      boundsH = window.innerHeight;
      topPad = 0;
      leftPad = 0;
    } else {
      rawX = canvasRect.left - (rootRect?.left ?? 0) + canvasX;
      rawY = canvasRect.top - (rootRect?.top ?? 0) + canvasY;
      boundsW = rootRect?.width ?? this.stageW;
      boundsH = rootRect?.height ?? this.stageH;
      topPad = 0;
      leftPad = 0;
    }
    const minX = leftPad + TOOLTIP_MARGIN + halfW;
    const maxX = Math.max(minX, boundsW - TOOLTIP_MARGIN - halfW);
    const clampedX = rawX < minX ? minX : rawX > maxX ? maxX : rawX;
    const arrowOffset = rawX - clampedX;
    const wantsAbove = rawY - tipH - 10 >= topPad + TOOLTIP_MARGIN;
    const fitsBelow = rawY + tipH + 14 <= boundsH - TOOLTIP_MARGIN;
    const place = wantsAbove ? "above" : fitsBelow ? "below" : "above";
    return {
      x: Math.round(clampedX),
      y: Math.round(rawY),
      place,
      arrowOffset: Math.round(arrowOffset)
    };
  }
  //Lane variant of buildTooltipFromPing: surfaces the full
  //entity name + current value when the cursor is parked over
  //the (potentially clipped) label column. Reuses the same
  //placement / arrow / clamp logic as the ping tooltip so a
  //hover-and-move from a label onto a ping does not flash the
  //bubble.
  buildTooltipFromLane(lane, canvasX, canvasY, sourceCanvas) {
    const placement = this.computeTooltipPlacement(canvasX, canvasY, sourceCanvas);
    const ageMs = Math.max(0, Date.now() - lane.lastPingTs);
    return {
      visible: true,
      x: placement.x,
      y: placement.y,
      place: placement.place,
      arrowOffset: placement.arrowOffset,
      //pingId is reused as an identity key for the
      //tooltip; we synthesise one from the lane index so
      //the renderer doesn't think the lane tooltip is the
      //same as a freshly hovered ping in the same lane.
      pingId: -(lane.laneIndex + 1),
      showCount: false,
      name: lane.friendlyName,
      entityId: lane.entityId,
      value: formatLaneValue(lane.lastState, lane.unit),
      previous: "",
      ago: formatAgo(ageMs, this._i18n),
      count: lane.pingCount,
      color: lane.color
    };
  }
  //When one strip loses the mouse we only drop the tooltip if
  //it was being driven by *that* strip; otherwise we'd flicker
  //away a tooltip the other canvas is actively showing.
  maybeHideTooltip(source) {
    if (!this._tooltip.visible) return;
    const driverIsGlobal = this._tooltip.showCount;
    if (source === "global" && driverIsGlobal || source === "stage" && !driverIsGlobal) {
      this._tooltip = EMPTY_TOOLTIP;
    }
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
__decorateClass([
  r()
], HermesCard.prototype, "_paused", 2);
HermesCard = __decorateClass([
  t("hermes-card")
], HermesCard);
function resolveConfig(cfg) {
  const showLabels = cfg.show_labels !== false;
  const labelWidth = showLabels ? clamp(cfg.label_width ?? 150, 0, 320) : 0;
  const valueWidth = clamp(cfg.value_width ?? 64, 0, 200);
  const theme = cfg.card_theme === "light" ? "light" : "dark";
  return {
    title: (cfg.title ?? "Activity").trim() || "Activity",
    theme,
    timespanSeconds: clamp(cfg.timespan_seconds ?? 300, 10, 24 * 3600),
    globalTimespanSeconds: clamp(cfg.global_timespan_seconds ?? 60, 5, 3600),
    globalHeight: clamp(cfg.global_height ?? 72, 32, 200),
    labelWidth,
    valueWidth,
    showLegend: cfg.show_legend !== false,
    showLastValue: cfg.show_last_value !== false,
    showGlobal: cfg.show_global !== false,
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
  if (maxWidth <= 0) return "";
  if (ctx.measureText(text).width <= maxWidth) return text;
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
const _entityHashCache = /* @__PURE__ */ new Map();
function entityHash(id) {
  const cached = _entityHashCache.get(id);
  if (cached !== void 0) return cached;
  let h2 = 2166136261;
  for (let i2 = 0; i2 < id.length; i2++) {
    h2 ^= id.charCodeAt(i2);
    h2 = h2 * 16777619 >>> 0;
  }
  const norm = h2 / 4294967296;
  _entityHashCache.set(id, norm);
  return norm;
}
let HermesMiniCard = class extends HermesCard {
  static getStubConfig() {
    return HermesCard.miniStubConfig();
  }
};
HermesMiniCard = __decorateClass([
  t("hermes-mini-card")
], HermesMiniCard);
export {
  HermesCard,
  HermesMiniCard
};
