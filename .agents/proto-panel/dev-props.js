/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — свойства выбранного элемента (dev-props.js, RE0030, Э5).

   Модель для панели Devmode без разметки: build(el) собирает блоки «Раскладка»,
   «Стиль», «Цвета», «Типографика», box model и HTML узла. Каждая строка —
   { k, parts, css, swatch, noBlock }: подпись, части значения (имя токена,
   пометка «по значению», вычисленное), объявление CSS для копирования —
   `свойство: var(--токен, запасное);` — и цвет для образца. Значения читает
   getComputedStyle, имена токенов — dev-tokens.js, кто элемент — dev-ds.js.
   Размер «по содержимому» и «растягивается» в копию блока не попадает (только строкой по клику): это измеренное, а не заданное. Единицы только px. Страницу не меняет. Тексты — strings.js.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  var M = PP && PP._measure, T = PP && PP._tokens, D = PP && PP._ds;
  if (!PP || !PP._strings || !M || !T || !D) return;
  var t = PP._strings.t;

  /* ---------------- части строки ---------------- */

  /** Часть значения из ответа dev-tokens: имя токена (если есть), примерность, вычисленное. */
  function part(r) { return { text: r.value, token: r.token, exact: r.exact, also: r.also || [] }; }
  function piece(r) { return r.token ? 'var(' + r.token + ', ' + r.value + ')' : r.value; }
  function line(prop, value) { return prop + ': ' + value + ';'; }
  function plain(k, value, extra) { var o = { k: k, parts: [{ text: String(value), token: '', exact: false, also: [] }], css: line(k, value) }; if (extra) for (var n in extra) o[n] = extra[n]; return o; }
  function px(v) { return M.fmt(M.num(v)) + 'px'; }
  function short(s, n) { s = String(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  /** Четыре стороны в сокращённую запись CSS: одно, два, три или четыре значения. */
  function quad(k, rs) {
    function key(r) { return r.raw + '|' + r.token; }
    var q = rs.map(key), use;
    if (rs.every(function (r) { return /^0(px)?$/.test(r.raw); })) return null;
    if (q[0] === q[1] && q[1] === q[2] && q[2] === q[3]) use = [rs[0]];
    else if (q[0] === q[2] && q[1] === q[3]) use = [rs[0], rs[1]];
    else if (q[1] === q[3]) use = [rs[0], rs[1], rs[2]];
    else use = rs;
    return { k: k, parts: use.map(part), css: line(k, use.map(piece).join(' ')) };
  }
  function sides(el, pre, post) {
    return ['top', 'right', 'bottom', 'left'].map(function (s) { return T.resolve(el, pre + '-' + s + (post ? '-' + post : '')); });
  }
  function corners(el) {
    return ['top-left', 'top-right', 'bottom-right', 'bottom-left'].map(function (c) { return T.resolve(el, 'border-' + c + '-radius'); });
  }

  /* ---------------- раскладка ---------------- */

  function gridList(v) {
    var a = String(v).split(/\s+/).filter(Boolean);
    if (a.length > 1 && a.every(function (x) { return x === a[0]; })) return 'repeat(' + a.length + ', ' + a[0] + ')';
    return short(a.join(' '), 90);
  }

  function sizeRow(el, b, mode, axis) {
    var prop = axis === 'w' ? 'width' : 'height', v = axis === 'w' ? b.w : b.h;
    var r = mode === 'fixed' ? T.resolve(el, prop) : null;
    var text = t('insp.' + mode) + ' ' + M.fmt(v) + 'px';
    return { k: prop, parts: [{ text: text, token: r ? r.token : '', exact: r ? r.exact : false, also: r ? r.also : [] }], css: line(prop, r && r.token ? 'var(' + r.token + ', ' + M.fmt(v) + 'px)' : M.fmt(v) + 'px'), noBlock: mode !== 'fixed' };
  }

  function layoutRows(el, b, s) {
    var cs = b.cs, rows = [], disp = cs.display;
    rows.push(plain('display', disp));
    if (cs.position !== 'static') rows.push(plain('position', cs.position));
    rows.push(sizeRow(el, b, s.w, 'w'), sizeRow(el, b, s.h, 'h'));
    [['min-width', 'minWidth', '0px'], ['max-width', 'maxWidth', 'none'], ['min-height', 'minHeight', '0px'], ['max-height', 'maxHeight', 'none']].forEach(function (p) {
      var v = cs[p[1]];
      if (v && v !== p[2] && v !== 'auto') rows.push(plain(p[0], v));
    });
    if (/flex/.test(disp)) {
      rows.push(plain('flex-direction', cs.flexDirection));
      if (cs.flexWrap !== 'nowrap') rows.push(plain('flex-wrap', cs.flexWrap));
      if (cs.justifyContent !== 'normal') rows.push(plain('justify-content', cs.justifyContent));
      if (cs.alignItems !== 'normal') rows.push(plain('align-items', cs.alignItems));
    }
    if (/grid/.test(disp)) {
      rows.push(plain('grid-template-columns', gridList(cs.gridTemplateColumns)));
      if (cs.gridTemplateRows !== 'none') rows.push(plain('grid-template-rows', gridList(cs.gridTemplateRows)));
    }
    if (/flex|grid/.test(disp)) {
      var rg = T.resolve(el, 'row-gap'), cg = T.resolve(el, 'column-gap');
      var zero = function (r) { return !r.raw || r.raw === 'normal' || /^0(px)?$/.test(r.raw); };
      if (!(zero(rg) && zero(cg))) {
        var same = rg.raw === cg.raw && rg.token === cg.token;
        rows.push({ k: 'gap', parts: (same ? [rg] : [rg, cg]).map(part), css: line('gap', (same ? [rg] : [rg, cg]).map(piece).join(' ')) });
      }
    }
    var par = el.parentElement && getComputedStyle(el.parentElement);
    if (par && /flex/.test(par.display)) {
      var g = M.num(cs.flexGrow), sh = M.num(cs.flexShrink);
      if (g !== 0 || sh !== 1 || cs.flexBasis !== 'auto') rows.push(plain('flex', g + ' ' + sh + ' ' + cs.flexBasis));
      if (cs.alignSelf !== 'auto') rows.push(plain('align-self', cs.alignSelf));
    }
    var pad = quad('padding', sides(el, 'padding')); if (pad) rows.push(pad);
    var mar = quad('margin', sides(el, 'margin')); if (mar) rows.push(mar);
    if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') rows.push(plain('overflow', cs.overflowX === cs.overflowY ? cs.overflowX : cs.overflowX + ' ' + cs.overflowY));
    if (cs.zIndex !== 'auto') rows.push(plain('z-index', cs.zIndex));
    return rows;
  }

  /* ---------------- стиль и цвета ---------------- */

  function borderSides(el, cs) {
    return ['top', 'right', 'bottom', 'left'].map(function (s) {
      var w = M.num(cs['border' + s.charAt(0).toUpperCase() + s.slice(1) + 'Width']), st = cs['border' + s.charAt(0).toUpperCase() + s.slice(1) + 'Style'];
      var on = w > 0 && st !== 'none' && st !== 'hidden';
      return { side: s, on: on, w: w, style: st, color: on ? T.resolve(el, 'border-' + s + '-color') : null };
    });
  }

  function styleRows(el, cs) {
    var rows = [];
    if (cs.backgroundImage && cs.backgroundImage !== 'none') rows.push(plain('background-image', short(cs.backgroundImage, 80)));
    var bs = borderSides(el, cs).filter(function (x) { return x.on; });
    if (bs.length === 4 && bs.every(function (x) { return x.w === bs[0].w && x.style === bs[0].style && x.color.raw === bs[0].color.raw && x.color.token === bs[0].color.token; })) {
      rows.push({ k: 'border', parts: [{ text: px(bs[0].w) + ' ' + bs[0].style, token: '', exact: false, also: [] }], css: line('border', px(bs[0].w) + ' ' + bs[0].style + ' ' + piece(bs[0].color)) });
    } else bs.forEach(function (x) {
      rows.push({ k: 'border-' + x.side, parts: [{ text: px(x.w) + ' ' + x.style, token: '', exact: false, also: [] }], css: line('border-' + x.side, px(x.w) + ' ' + x.style + ' ' + piece(x.color)) });
    });
    var rad = quad('border-radius', corners(el)); if (rad) rows.push(rad);
    if (cs.boxShadow && cs.boxShadow !== 'none') { var sh = T.resolve(el, 'box-shadow'); rows.push({ k: 'box-shadow', parts: [part(sh)], css: line('box-shadow', piece(sh)) }); }
    if (cs.opacity !== '1') rows.push(plain('opacity', cs.opacity));
    return rows;
  }

  function swatchRow(k, prop, r) {
    return { k: k, swatch: r.raw, parts: [part(r)], css: line(prop, piece(r)) };
  }

  function colorRows(el, cs, text) {
    var rows = [];
    var bg = T.resolve(el, 'background-color');
    if (bg.raw && !T.transparent(bg.raw)) rows.push(swatchRow(t('css.fill'), 'background-color', bg));
    if (text) { var fg = T.resolve(el, 'color'); rows.push(swatchRow(el.matches('[data-icon]') ? t('css.icon') : t('css.text'), 'color', fg)); }
    var bs = borderSides(el, cs).filter(function (x) { return x.on; });
    if (bs.length) {
      var first = bs[0].color, allSame = bs.every(function (x) { return x.color.raw === first.raw && x.color.token === first.token; });
      if (allSame) rows.push(swatchRow(t('css.stroke'), 'border-color', first));
      else bs.forEach(function (x) { rows.push(swatchRow(t('css.stroke') + ' ' + x.side, 'border-' + x.side + '-color', x.color)); });
    }
    return rows;
  }

  /* ---------------- типографика ---------------- */

  function hasText(el) {
    if (el.matches('input, textarea, select')) return true;
    for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && /\S/.test(n.nodeValue)) return true;
    return false;
  }

  function typeRows(el, cs) {
    var rows = [], tk = T.typeToken(el);
    var fam = T.resolve(el, 'font-family'), wt = T.resolve(el, 'font-weight');
    var size = px(cs.fontSize), lh = cs.lineHeight === 'normal' ? 'normal' : px(cs.lineHeight);
    if (tk.token) {
      var tv = T.value(tk.token);
      rows.push({ k: t('type.style'), parts: [{ text: tv, token: tk.token, exact: tk.exact, also: tk.also }], css: line('font', 'var(' + tk.token + ', ' + tv + ')'), block: true });
    }
    var famName = String(cs.fontFamily).split(',')[0].replace(/["']/g, '').trim();
    rows.push({ k: 'font-family', parts: [{ text: famName, token: fam.token, exact: fam.exact, also: fam.also }], css: line('font-family', piece(fam)), noBlock: !!tk.token });
    rows.push({ k: 'font-size', parts: [{ text: size, token: '', exact: false, also: [] }], css: line('font-size', size), noBlock: !!tk.token });
    rows.push({ k: 'line-height', parts: [{ text: lh, token: '', exact: false, also: [] }], css: line('line-height', lh), noBlock: !!tk.token });
    rows.push({ k: 'font-weight', parts: [{ text: wt.value, token: wt.token, exact: wt.exact, also: wt.also }], css: line('font-weight', piece(wt)), noBlock: !!tk.token });
    if (cs.letterSpacing !== 'normal' && !/^0(px)?$/.test(cs.letterSpacing)) rows.push(plain('letter-spacing', cs.letterSpacing));
    if (!/^(start|left)$/.test(cs.textAlign)) rows.push(plain('text-align', cs.textAlign));
    if (cs.textTransform !== 'none') rows.push(plain('text-transform', cs.textTransform));
    if (cs.textDecorationLine !== 'none') rows.push(plain('text-decoration', cs.textDecorationLine));
    return rows;
  }

  /* ---------------- HTML узла ---------------- */

  /** Разметка узла без служебного: классы и атрибуты панели сняты, svg иконок и иллюстраций — пустые слоты. */
  function code(el) {
    var c = el.cloneNode(true);
    if (PP._states) PP._states.unforce(c, el);   // состояния, поставленные панелью, в разметку не входят
    var all = [c].concat(Array.prototype.slice.call(c.querySelectorAll('*')));
    var walker = document.createTreeWalker(c, NodeFilter.SHOW_COMMENT), dead = [];
    while (walker.nextNode()) dead.push(walker.currentNode);
    dead.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
    all.forEach(function (n) {
      Array.prototype.slice.call(n.attributes).forEach(function (a) { if (/^data-pp-|^data-icon-done$/.test(a.name)) n.removeAttribute(a.name); });
      if (n.classList) {
        Array.prototype.slice.call(n.classList).forEach(function (cl) { if (/^pp-/.test(cl)) n.classList.remove(cl); });
        if (!n.classList.length && n.hasAttribute('class')) n.removeAttribute('class');
      }
      if (n.matches && n.matches('[data-icon], [data-illu]')) n.innerHTML = '';
    });
    var html = c.outerHTML.replace(/>\s+</g, '>\n<');
    return { html: html.length > 40000 ? html.slice(0, 40000) : html, cut: html.length > 40000 };
  }

  /* ---------------- сборка ---------------- */

  function build(el) {
    var b = M.box(el), s = M.sizing(el), cs = b.cs, text = hasText(el) || el.matches('[data-icon]');
    var cls = M.classes(el);
    return {
      tag: el.tagName.toLowerCase(), id: el.id || '', classes: cls, title: M.describe(el),
      identity: D.info(el),
      box: { m: b.m, b: b.b, p: b.p, w: b.w, h: b.h, sizing: b.sizing, r: corners(el), tp: sides(el, 'padding'), tm: sides(el, 'margin') },
      layout: layoutRows(el, b, s),
      style: styleRows(el, cs),
      colors: colorRows(el, cs, text),
      type: hasText(el) ? typeRows(el, cs) : [],
      readable: T.readable()
    };
  }

  /** Объявления блока для копирования целиком. */
  function blockCss(rows) { return rows.filter(function (r) { return r.css && !r.noBlock; }).map(function (r) { return r.css; }).join('\n'); }

  PP._props = { build: build, blockCss: blockCss, code: code };
})();
