/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — имена токенов для Devmode (dev-tokens.js, RE0030, Э5).

   getComputedStyle отдаёт уже вычисленное значение без имени: padding 16px,
   цвет rgb(…). Имя токена достаётся двумя путями:

   1. По объявлению (точно). Из таблиц стилей берутся правила, которым элемент
      подходит, и в их значениях ищутся var(--токен). Найденное принимается,
      только если значение токена на этом элементе равно вычисленному: так
      правило, проигравшее в каскаде, не называет чужой токен, а специфичность
      считать не нужно. Таблицы читаются на localhost; по file:// Chromium
      закрывает таблицы ДС, и остаётся второй путь.
   2. По значению (примерно). Токены читаются из вычисленных стилей корня
      (там перечислены все пользовательские свойства, в том числе по file://);
      вычисленное значение элемента сопоставляется с ними. Совпадений бывает
      несколько (--space-16 и --pad-card): первым идёт основной токен шкалы,
      остальные — «также». Показывается пометкой, что имя угадано по значению.

   Значения сравниваются после нормализации браузером: свой скрытый элемент
   .pp-probe получает значение свойством и отдаёт вычисленное (так #fff и
   rgb(255,255,255), 0 1px 2px red и rgb(255,0,0) 0 1px 2px сходятся). Ничего,
   кроме этого элемента, в страницу не пишется; dispose() снимает его.
   Типографика — отдельно: токен --type-* это шрифтовое сокращение
   (вес размер/интерлиньяж семейство), оно сверяется по частям.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  if (!PP) return;

  var probe = null;
  var tokens = null;            // { at, theme, names: [], value: {} }
  var rev = {};                 // вид → { норма значения: [токены] }
  var rulesOf = typeof WeakMap === 'function' ? new WeakMap() : null;

  /* ---------------- токены ---------------- */

  function theme() { return document.documentElement.getAttribute('data-theme') || ''; }

  function index() {
    var now = Date.now();
    if (tokens && tokens.theme === theme() && now - tokens.at < 3000) return tokens;
    var cs = getComputedStyle(document.documentElement), names = [], value = {};
    for (var i = 0; i < cs.length; i++) {
      var n = cs[i];
      if (n.indexOf('--') !== 0) continue;
      var v = cs.getPropertyValue(n).trim();
      if (!v) continue;
      names.push(n); value[n] = v;
    }
    if (!tokens || tokens.theme !== theme()) { rev = {}; if (rulesOf && typeof WeakMap === 'function') rulesOf = new WeakMap(); }
    tokens = { at: now, theme: theme(), names: names, value: value };
    return tokens;
  }

  function getProbe() {
    if (probe && probe.isConnected) return probe;
    probe = document.createElement('span');
    probe.className = 'pp-probe';
    probe.hidden = true;
    document.documentElement.appendChild(probe);
    return probe;
  }

  /** Значение свойства в том виде, как его вычислит браузер; не разобралось — исходная строка. */
  function norm(prop, value) {
    var v = String(value == null ? '' : value).trim();
    if (!v) return '';
    var p = getProbe();
    p.style.cssText = '';
    p.style.setProperty(prop, v);
    var out = p.style.getPropertyValue(prop) ? getComputedStyle(p).getPropertyValue(prop) : v;
    p.style.cssText = '';
    return String(out).trim();
  }

  /* ---------------- виды значений ---------------- */

  var COLOR_PROP = /(^|-)color$|^fill$|^stroke$/;
  function kindOf(prop) {
    if (COLOR_PROP.test(prop)) return 'color';
    if (/^(padding|margin)-|^(row-|column-)?gap$/.test(prop)) return 'space';
    if (/radius$/.test(prop)) return 'radius';
    if (prop === 'box-shadow') return 'shadow';
    if (prop === 'font-family') return 'family';
    if (prop === 'font-weight') return 'weight';
    return '';
  }
  var COLOR_VALUE = /^(#|rgb|hsl|hwb|oklch|oklab|lab\(|lch\(|color\(|color-mix\(|transparent|currentcolor)/i;
  var FAMILY = {
    color: function (n, v) { return COLOR_VALUE.test(v); },
    space: function (n) { return /^--(space-\d|gap-|pad-|layout-pad|layout-block-gap)/.test(n); },
    radius: function (n) { return /^--radius-/.test(n); },
    shadow: function (n) { return /^--(elevation|shadow)-/.test(n); },
    family: function (n) { return /^--font-/.test(n); },
    weight: function (n) { return /^--weight-/.test(n); }
  };
  /* Основной токен шкалы идёт первым, псевдонимы по назначению — после него. */
  var PRIMARY = {
    color: function (n) { return !/^--[a-z]+-(a)?\d{2,3}$/i.test(n) && !/^--(c|m)?grey|^--swamp/.test(n) ? 0 : 1; },
    space: function (n) { return /^--space-\d/.test(n) ? 0 : 1; },
    radius: function (n) { return /^--radius-(none|2xs|xs|s|m|l|[2-7]?xl|full|circle)$/.test(n) ? 0 : 1; },
    shadow: function () { return 0; }, family: function () { return 0; }, weight: function () { return 0; }
  };

  function byValue(kind, prop, actual) {
    if (!FAMILY[kind]) return [];
    var key = kind + '|' + prop;
    var T = index();
    if (!rev[key]) {
      var m = {};
      T.names.forEach(function (n) {
        if (!FAMILY[kind](n, T.value[n])) return;
        var k = norm(prop, T.value[n]);
        if (!k) return;
        (m[k] = m[k] || []).push(n);
      });
      Object.keys(m).forEach(function (k) { m[k].sort(function (a, b) { return PRIMARY[kind](a) - PRIMARY[kind](b); }); });
      rev[key] = m;
    }
    return (rev[key][norm(prop, actual)] || []).slice();
  }

  /* ---------------- по объявлению (CSSOM) ---------------- */

  /** Объявления правил, которым подходит элемент, в порядке таблиц; последним — style элемента. */
  function declarations(el) {
    var hit = rulesOf && rulesOf.get(el);
    if (hit && Date.now() - hit.at < 1500) return hit.list;
    var out = [];
    function walk(rules) {
      for (var i = 0; i < rules.length; i++) {
        var r = rules[i];
        if (r.selectorText && r.style) {
          try { if (el.matches(r.selectorText)) out.push(r.style); } catch (e) { /* селектор вне поддержки */ }
        } else if (r.styleSheet) {
          try { walk(r.styleSheet.cssRules); } catch (e) { /* чужая таблица закрыта */ }
        } else if (r.cssRules && r.cssRules.length) {
          if (r.media && !window.matchMedia(r.media.mediaText).matches) continue;
          if (r.conditionText && r.constructor && /Supports/.test(r.constructor.name) && window.CSS && CSS.supports && !CSS.supports(r.conditionText)) continue;
          walk(r.cssRules);
        }
      }
    }
    var sheets = document.styleSheets;
    for (var s = 0; s < sheets.length; s++) {
      var rules;
      try { rules = sheets[s].cssRules; } catch (e) { continue; }
      walk(rules);
    }
    if (el.style && el.style.length) out.push(el.style);
    if (rulesOf) rulesOf.set(el, { at: Date.now(), list: out });
    return out;
  }

  /** Читаются ли таблицы ДС: по file:// — нет, и имена токенов будут угаданы по значению. */
  function readable() {
    var sheets = document.styleSheets, any = false;
    for (var i = 0; i < sheets.length; i++) { try { sheets[i].cssRules; any = true; } catch (e) { return false; } }
    return any;
  }

  function splitTop(s) {
    var out = [], depth = 0, cur = '';
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (/\s/.test(ch) && depth === 0) { if (cur) out.push(cur); cur = ''; } else cur += ch;
    }
    if (cur) out.push(cur);
    return out;
  }
  function expand4(a) {
    if (a.length === 1) return [a[0], a[0], a[0], a[0]];
    if (a.length === 2) return [a[0], a[1], a[0], a[1]];
    if (a.length === 3) return [a[0], a[1], a[2], a[1]];
    return a.slice(0, 4);
  }
  var SIDE = { top: 0, right: 1, bottom: 2, left: 3 };
  var CORNER = { 'top-left': 0, 'top-right': 1, 'bottom-right': 2, 'bottom-left': 3 };

  /** Строки значений, которыми объявление могло задать свойство: само свойство и сокращения. */
  function pieces(style, prop) {
    var out = [], v = style.getPropertyValue(prop), m;
    if (v) out.push(v);
    function four(sh, i) { var s = style.getPropertyValue(sh); if (s) out.push(expand4(splitTop(s))[i] || ''); }
    if ((m = /^(padding|margin)-(top|right|bottom|left)$/.exec(prop))) four(m[1], SIDE[m[2]]);
    else if ((m = /^border-(top|right|bottom|left)-(width|color|style)$/.exec(prop))) {
      four('border-' + m[2], SIDE[m[1]]);
      ['border-' + m[1], 'border'].forEach(function (sh) { var s = style.getPropertyValue(sh); if (s) out.push(s); });
    } else if ((m = /^border-(top-left|top-right|bottom-right|bottom-left)-radius$/.exec(prop))) four('border-radius', CORNER[m[1]]);
    else if (prop === 'row-gap' || prop === 'column-gap') {
      var g = style.getPropertyValue('gap');
      if (g) { var gv = splitTop(g); out.push(prop === 'row-gap' ? gv[0] : gv[1] || gv[0]); }
    } else if (prop === 'background-color') { var bg = style.getPropertyValue('background'); if (bg) out.push(bg); }
    return out;
  }

  /** Токен, которым объявлено свойство элемента, или ''. Принимается только токен, чьё значение равно вычисленному. */
  function declared(el, prop, actual) {
    var list = declarations(el), want = norm(prop, actual), cs = getComputedStyle(el), found = '';
    for (var i = 0; i < list.length; i++) {
      pieces(list[i], prop).forEach(function (piece) {
        var re = /var\(\s*(--[\w-]+)/g, m;
        while ((m = re.exec(piece))) {
          var tv = cs.getPropertyValue(m[1]).trim();
          if (tv && norm(prop, tv) === want) found = m[1];
        }
      });
    }
    return found;
  }

  /* ---------------- цвет и числа для показа ---------------- */

  function hex2(n) { n = Math.max(0, Math.min(255, Math.round(n))); return (n < 16 ? '0' : '') + n.toString(16); }
  /** Цвет вычисленного вида → #rrggbb или #rrggbbaa; не разобрался — как есть. */
  function hex(css) {
    var c = String(css || '').trim(), m;
    if ((m = /^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i.exec(c))) {
      var a = m[4] == null ? 1 : /%$/.test(m[4]) ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
      return '#' + hex2(m[1]) + hex2(m[2]) + hex2(m[3]) + (a < 1 ? hex2(a * 255) : '');
    }
    if ((m = /^color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i.exec(c))) {
      var a2 = m[4] == null ? 1 : /%$/.test(m[4]) ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
      return '#' + hex2(m[1] * 255) + hex2(m[2] * 255) + hex2(m[3] * 255) + (a2 < 1 ? hex2(a2 * 255) : '');
    }
    return c;
  }
  function transparent(css) { return /^(transparent|rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\))$/i.test(String(css).trim()) || /^#[0-9a-f]{6}00$/i.test(hex(css)); }

  function show(kind, v) { return kind === 'color' ? hex(v) : String(v).trim(); }

  /* ---------------- ответ по свойству ---------------- */

  /** { prop, raw, value, token, exact, also } для свойства элемента; token — '' если имени нет. */
  function resolve(el, prop) {
    var cs = getComputedStyle(el), raw = cs.getPropertyValue(prop).trim(), kind = kindOf(prop);
    var out = { prop: prop, raw: raw, value: show(kind, raw), token: '', exact: false, also: [] };
    if (!raw) return out;
    var d = declared(el, prop, raw);
    if (d) { out.token = d; out.exact = true; return out; }
    if (kind === 'space' && /^0(px)?$/.test(raw)) return out;
    var list = byValue(kind, prop, raw);
    if (list.length) {
      out.token = list[0]; out.also = list.slice(1, 4);
      /* шрифт и начертание: один токен на значение — это и есть имя, угадывать нечего */
      if ((kind === 'family' || kind === 'weight') && list.length === 1) out.exact = true;
    }
    return out;
  }

  /* ---------------- типографика ---------------- */

  /** Разбор шрифтового токена: { weight, size, line, family } в числах и строке; не по форме — null. */
  function parseType(v) {
    var m = /^(\d+|normal|bold|light)\s+([\d.]+)px\s*\/\s*([\d.]+)px\s+(.+)$/.exec(String(v).trim());
    return m ? { weight: m[1], size: parseFloat(m[2]), line: parseFloat(m[3]), family: m[4] } : null;
  }
  function firstFamily(f) { return String(f).split(',')[0].replace(/["']/g, '').trim().toLowerCase(); }

  /** Шрифтовой токен элемента: { token, exact, also } по классу ds-*, по объявлению font или по значению. */
  function typeToken(el) {
    var cs = getComputedStyle(el), T = index();
    var size = parseFloat(cs.fontSize), line = cs.lineHeight === 'normal' ? NaN : parseFloat(cs.lineHeight);
    var weight = String(cs.fontWeight), fam = firstFamily(cs.fontFamily);
    function fits(n) {
      var p = parseType(T.value[n]);
      return !!p && p.size === size && (isNaN(line) || p.line === line) && String(p.weight) === weight && firstFamily(p.family) === fam;
    }
    var names = T.names.filter(function (n) { return /^--type-/.test(n); });
    var out = { token: '', exact: false, also: [] };
    var cls = Array.prototype.filter.call(el.classList || [], function (c) { return /^ds-/.test(c) && T.value['--type-' + c.slice(3)]; });
    for (var i = 0; i < cls.length; i++) if (fits('--type-' + cls[i].slice(3))) { out.token = '--type-' + cls[i].slice(3); out.exact = true; return out; }
    var list = declarations(el);
    for (var j = 0; j < list.length; j++) {
      var f = list[j].getPropertyValue('font'), m = f && /var\(\s*(--type-[\w-]+)/.exec(f);
      if (m && T.value[m[1]] && fits(m[1])) { out.token = m[1]; out.exact = true; }
    }
    if (out.token) return out;
    var hit = names.filter(fits);
    if (hit.length) { out.token = hit[0]; out.also = hit.slice(1, 4); }
    return out;
  }

  function dispose() {
    if (probe && probe.parentNode) probe.parentNode.removeChild(probe);
    probe = null; tokens = null; rev = {};
    if (rulesOf && typeof WeakMap === 'function') rulesOf = new WeakMap();
  }

  PP._tokens = { resolve: resolve, typeToken: typeToken, parseType: parseType, hex: hex, transparent: transparent, readable: readable, norm: norm, dispose: dispose, value: function (n) { return index().value[n] || ''; } };
})();
