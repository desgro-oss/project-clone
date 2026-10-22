/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — доступность выбранного элемента (dev-a11y.js, RE0030, Э6).

   Для панели Devmode: роль (явная role или по тегу), доступное имя и его
   источник, фокус и aria-состояния, контраст текста или иконки к фону.
   Имя считается упрощённо по правилам accname: aria-labelledby, aria-label,
   нативная подпись (label, alt, caption, legend, value), содержимое для ролей,
   которые берут имя из него, затем title и placeholder. Полной реализации
   стандарта здесь нет — это подсказка разработчику, а не аудит.
   Контраст — по WCAG 2.x: цвет текста (с учётом непрозрачности) против
   составного фона предков; фон-картинка или градиент — расчёта нет, панель так
   и пишет. Ничего не пишет в DOM. Тексты — strings.js.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  var M = PP && PP._measure;
  if (!PP || !M) return;

  /* ---------------- роль ---------------- */

  var INPUT = { button: 'button', submit: 'button', reset: 'button', image: 'button', checkbox: 'checkbox', radio: 'radio', range: 'slider', number: 'spinbutton', search: 'searchbox' };
  var TAG = {
    button: 'button', textarea: 'textbox', nav: 'navigation', main: 'main', aside: 'complementary', article: 'article', dialog: 'dialog',
    ul: 'list', ol: 'list', menu: 'list', li: 'listitem', table: 'table', thead: 'rowgroup', tbody: 'rowgroup', tfoot: 'rowgroup', tr: 'row', td: 'cell',
    hr: 'separator', progress: 'progressbar', meter: 'meter', output: 'status', p: 'paragraph', figure: 'figure', details: 'group', fieldset: 'group',
    h1: 'heading', h2: 'heading', h3: 'heading', h4: 'heading', h5: 'heading', h6: 'heading', form: 'form', option: 'option', optgroup: 'group'
  };
  /* Роли, чьё имя берётся из содержимого. */
  var FROM_CONTENT = /^(button|link|menuitem|menuitemcheckbox|menuitemradio|tab|option|checkbox|radio|switch|heading|cell|gridcell|row|columnheader|rowheader|treeitem|tooltip|listitem|caption|status|alert|paragraph|article|banner)$/;
  /* Роли, которым имя обязательно: без него вспомогательная технология читает пустоту. */
  var NEEDS_NAME = /^(button|link|checkbox|radio|switch|textbox|searchbox|combobox|listbox|slider|spinbutton|tab|menuitem|menuitemcheckbox|menuitemradio|option|treeitem|dialog|img)$/;

  function role(el) {
    var explicit = (el.getAttribute('role') || '').trim().split(/\s+/)[0];
    if (explicit) return { role: explicit, explicit: true, level: explicit === 'heading' ? el.getAttribute('aria-level') || '' : '' };
    var tag = el.tagName.toLowerCase(), r = '', level = '';
    if (tag === 'a' || tag === 'area') r = el.hasAttribute('href') ? 'link' : '';
    else if (tag === 'input') {
      var ty = (el.getAttribute('type') || 'text').toLowerCase();
      if (ty === 'hidden') r = '';
      else if (el.hasAttribute('list') && /^(text|search|tel|url|email)$/.test(ty)) r = 'combobox';
      else r = INPUT[ty] || 'textbox';
    } else if (tag === 'select') r = el.multiple || el.size > 1 ? 'listbox' : 'combobox';
    else if (tag === 'img') r = el.getAttribute('alt') === '' ? 'presentation' : 'img';
    else if (tag === 'th') r = el.getAttribute('scope') === 'row' ? 'rowheader' : 'columnheader';
    else if (tag === 'header' || tag === 'footer') r = el.closest('article, section, main, aside, nav') ? '' : tag === 'header' ? 'banner' : 'contentinfo';
    else if (tag === 'section') r = el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby') ? 'region' : '';
    else r = TAG[tag] || '';
    if (r === 'heading') level = tag.charAt(1);
    if (r === 'form' && !(el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby'))) r = '';
    return { role: r, explicit: false, level: level };
  }

  /* ---------------- доступное имя ---------------- */

  function hidden(n) {
    if (!n || n.nodeType !== 1) return false;
    if (n.hasAttribute('hidden') || n.getAttribute('aria-hidden') === 'true') return true;
    var cs = getComputedStyle(n);
    return cs.display === 'none' || cs.visibility === 'hidden';
  }
  function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }

  /** Текст содержимого узла; чужие aria-label и alt вложенных узлов в него входят. */
  function content(el, seen, depth) {
    if (depth > 8) return '';
    var out = '';
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3) out += n.nodeValue;
      else if (n.nodeType === 1) {
        if (M.own(n) || hidden(n) || /^(script|style|template)$/i.test(n.tagName)) continue;
        var tag = n.tagName.toLowerCase(), part = '';
        if (n.hasAttribute('aria-label') && clean(n.getAttribute('aria-label'))) part = n.getAttribute('aria-label');
        else if (tag === 'img') part = n.getAttribute('alt') || '';
        else if (tag === 'svg') { var ti = n.querySelector('title'); part = ti ? ti.textContent : ''; }
        else if (tag === 'input' || tag === 'textarea' || tag === 'select') part = n.value || '';
        else part = content(n, seen, depth + 1);
        var disp = getComputedStyle(n).display;
        out += (/^(block|flex|grid|list-item|table)/.test(disp) ? ' ' : '') + part + (/^(block|flex|grid|list-item|table)/.test(disp) ? ' ' : '');
      }
    }
    return clean(out);
  }

  function byIds(attr, el) {
    return clean((el.getAttribute(attr) || '').split(/\s+/).map(function (id) { var n = id && document.getElementById(id); return n ? clean(n.getAttribute('aria-label') || content(n, null, 0) || n.textContent) : ''; }).filter(Boolean).join(' '));
  }

  /** Подпись поля: label[for], объемлющий label (текст без самого поля). */
  function labelOf(el) {
    var texts = [];
    if (el.labels && el.labels.length) Array.prototype.forEach.call(el.labels, function (l) { texts.push(content(l, null, 0)); });
    else if (el.id) Array.prototype.forEach.call(document.querySelectorAll('label[for="' + (window.CSS && CSS.escape ? CSS.escape(el.id) : el.id) + '"]'), function (l) { texts.push(content(l, null, 0)); });
    return clean(texts.filter(Boolean).join(' '));
  }

  /** { name, source } — source: aria-labelledby | aria-label | label | alt | caption | legend | content | value | title | placeholder | none. */
  function name(el, rl) {
    var v;
    if ((v = byIds('aria-labelledby', el))) return { name: v, source: 'aria-labelledby' };
    if ((v = clean(el.getAttribute('aria-label')))) return { name: v, source: 'aria-label' };
    var tag = el.tagName.toLowerCase(), ty = (el.getAttribute('type') || '').toLowerCase();
    if (tag === 'input' && /^(button|submit|reset)$/.test(ty)) { v = clean(el.value) || (ty === 'submit' ? 'Submit' : ty === 'reset' ? 'Reset' : ''); if (v) return { name: v, source: 'value' }; }
    if (tag === 'input' && ty === 'image' && (v = clean(el.getAttribute('alt')))) return { name: v, source: 'alt' };
    if (/^(input|textarea|select|meter|progress|output)$/.test(tag) && (v = labelOf(el))) return { name: v, source: 'label' };
    if (tag === 'img' && (v = clean(el.getAttribute('alt')))) return { name: v, source: 'alt' };
    if (tag === 'svg' && el.querySelector('title')) return { name: clean(el.querySelector('title').textContent), source: 'content' };
    if (tag === 'table' && (v = el.querySelector('caption') && clean(el.querySelector('caption').textContent))) return { name: v, source: 'caption' };
    if (tag === 'fieldset' && (v = el.querySelector('legend') && clean(el.querySelector('legend').textContent))) return { name: v, source: 'legend' };
    if (tag === 'figure' && (v = el.querySelector('figcaption') && clean(el.querySelector('figcaption').textContent))) return { name: v, source: 'caption' };
    if ((FROM_CONTENT.test(rl.role) || (!rl.role && tag === 'summary')) && (v = content(el, null, 0))) return { name: v, source: 'content' };
    if ((v = clean(el.getAttribute('title')))) return { name: v, source: 'title' };
    if (/^(input|textarea)$/.test(tag) && (v = clean(el.getAttribute('placeholder')))) return { name: v, source: 'placeholder' };
    return { name: '', source: 'none' };
  }

  /* ---------------- фокус и aria-состояния ---------------- */

  function focusable(el) {
    if (el.disabled) return { yes: false, why: 'disabled' };
    var ti = el.getAttribute('tabindex');
    if (ti !== null && ti !== '' && !isNaN(+ti)) return { yes: true, tabindex: +ti };
    var tag = el.tagName.toLowerCase();
    if ((tag === 'a' || tag === 'area') && el.hasAttribute('href')) return { yes: true, tabindex: 0 };
    if (/^(button|select|textarea|summary)$/.test(tag)) return { yes: true, tabindex: 0 };
    if (tag === 'input' && (el.getAttribute('type') || '').toLowerCase() !== 'hidden') return { yes: true, tabindex: 0 };
    if (el.isContentEditable) return { yes: true, tabindex: 0 };
    return { yes: false, why: '' };
  }

  function ariaList(el) {
    var out = [];
    Array.prototype.forEach.call(el.attributes, function (a) {
      if (/^aria-/.test(a.name) && a.name !== 'aria-label' && a.name !== 'aria-labelledby') out.push(a.name + '=' + a.value);
    });
    ['disabled', 'required', 'readonly', 'checked', 'multiple'].forEach(function (p) {
      if (el.hasAttribute(p)) out.push(p);
    });
    return out;
  }

  /* ---------------- контраст ---------------- */

  var cv = null;
  function rgba(css) {
    var c = String(css || '').trim(), m;
    if ((m = /^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i.exec(c))) return [+m[1], +m[2], +m[3], m[4] == null ? 1 : /%$/.test(m[4]) ? parseFloat(m[4]) / 100 : parseFloat(m[4])];
    if ((m = /^color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i.exec(c))) return [m[1] * 255, m[2] * 255, m[3] * 255, m[4] == null ? 1 : /%$/.test(m[4]) ? parseFloat(m[4]) / 100 : parseFloat(m[4])];
    if (c === 'transparent') return [0, 0, 0, 0];
    try {   // остальные записи (oklch, lab, hsl) нормализует холст
      cv = cv || document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      if (!cv) return null;
      cv.canvas.width = cv.canvas.height = 1;
      cv.clearRect(0, 0, 1, 1);
      cv.fillStyle = '#010203'; cv.fillStyle = c;
      var probe = cv.fillStyle; cv.fillStyle = '#fdfcfb'; cv.fillStyle = c;
      if (probe !== cv.fillStyle) return null;   // запись не разобралась
      cv.fillRect(0, 0, 1, 1);
      var d = cv.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    } catch (e) { return null; }
  }
  function over(top, bottom) {
    var a = top[3] + bottom[3] * (1 - top[3]);
    if (a <= 0) return [0, 0, 0, 0];
    return [0, 1, 2].map(function (i) { return (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a; }).concat([a]);
  }
  function lum(c) {
    var l = c.slice(0, 3).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
  }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function hex(c) { return '#' + c.slice(0, 3).map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }

  /** Составной фон за элементом: { color } | { image: true } | { assumed: true, color }. */
  function backdrop(el) {
    var layers = [], opacity = 1, n;
    for (n = el; n && n.nodeType === 1; n = n.parentElement) {
      var cs = getComputedStyle(n), o = parseFloat(cs.opacity);
      if (!isNaN(o)) opacity *= o;
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return { image: true, opacity: opacity };
      var bg = rgba(cs.backgroundColor);
      if (bg && bg[3] > 0) { layers.push(bg); if (bg[3] >= 0.999) break; }
    }
    var assumed = !layers.length || layers[layers.length - 1][3] < 0.999;
    var base = assumed ? [255, 255, 255, 1] : layers.pop();
    var color = layers.reduceRight(function (under, top) { return over(top, under); }, base);
    return { color: color, assumed: assumed, opacity: opacity };
  }

  function hasText(el) {
    if (el.matches('input, textarea, select')) return true;
    for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && /\S/.test(n.nodeValue)) return true;
    return false;
  }

  /** Чей текст мерить: сам элемент, а у кнопки, ссылки и других управляющих — первый вложенный элемент с текстом или иконкой (подпись внутри .btn__label). */
  function textHost(el, rl) {
    if (hasText(el) || el.matches('[data-icon]')) return el;
    if (!NEEDS_NAME.test(rl.role) || rl.role === 'img') return null;
    var w = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT), n, i = 0;
    while ((n = w.nextNode()) && i++ < 200) if (!M.own(n) && !hidden(n) && (hasText(n) || n.matches('[data-icon]'))) return n;
    return null;
  }

  /** Контраст: null — у элемента нет текста и это не иконка. Иначе { ok, ratio, need, fg, bg, large, icon, of, … }; of — имя вложенного элемента, чей цвет измерен. */
  function contrast(el, rl) {
    var host = textHost(el, rl || role(el));
    if (!host) return null;
    var of = host === el ? '' : M.describe(host);
    el = host;
    var icon = el.matches('[data-icon]');
    var cs = getComputedStyle(el), fg = rgba(cs.color), bd = backdrop(el);
    if (!fg) return { unknown: 'color', of: of };
    if (bd.image) return { unknown: 'image', of: of };
    var alpha = fg[3] * bd.opacity;
    var text = over([fg[0], fg[1], fg[2], alpha], bd.color);
    var size = parseFloat(cs.fontSize), bold = (parseInt(cs.fontWeight, 10) || 400) >= 700;
    var large = !icon && (size >= 24 || (size >= 18.66 && bold));
    var need = icon || large ? 3 : 4.5, r = ratio(text, bd.color);
    return { ok: r >= need, aaa: r >= (large ? 4.5 : 7), ratio: r, need: need, fg: hex(text), bg: hex(bd.color), large: large, icon: icon, of: of, assumed: bd.assumed, faded: bd.opacity < 0.999 || fg[3] < 0.999 };
  }

  /* ---------------- сборка ---------------- */

  function build(el) {
    var rl = role(el), nm = name(el, rl), f = focusable(el), cs = getComputedStyle(el);
    var issues = [];
    var interactive = NEEDS_NAME.test(rl.role);
    if (interactive && !nm.name && rl.role !== 'img') issues.push('noName');
    if (rl.role === 'img' && !nm.name && !(el.tagName.toLowerCase() === 'svg' && el.getAttribute('aria-hidden') === 'true')) issues.push('noAlt');
    if (el.tagName.toLowerCase() === 'img' && !el.hasAttribute('alt')) issues.push('noAltAttr');
    if (el.getAttribute('aria-hidden') === 'true' && f.yes) issues.push('hiddenFocusable');
    var c = contrast(el, rl);
    if (c && c.ok === false && !(el.disabled || el.getAttribute('aria-disabled') === 'true')) issues.push('lowContrast');
    return {
      role: rl, name: nm, focus: f, aria: ariaList(el), contrast: c, issues: issues,
      hiddenFromAT: el.getAttribute('aria-hidden') === 'true' || cs.visibility === 'hidden',
      disabled: !!el.disabled || el.getAttribute('aria-disabled') === 'true'
    };
  }

  PP._a11y = { build: build, role: role, name: name, contrast: contrast, ratio: ratio };
})();
