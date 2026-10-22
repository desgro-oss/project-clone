/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — содержимое панели Devmode (dev-pane.js, RE0030 Э4–Э6, RE0031 Э1).

   Пункт рельса «Devmode» (ui.js, renderDevPane зовёт render). Инструменты и оверлеи — в тулбаре на
   странице (dev-toolbar.js); в панели секции, разделённые линией, каждая сворачивается (настройка devFolds):
   кто элемент (компонент ДС, виджет, иконка — dev-ds.js) с крошками и переходами по дереву;
   box model; CSS — блоки «Layout» и «Style» кодом с подсветкой или списком (настройка devView);
   HTML узла с подсветкой (под CSS); цвета «образец · токен · hex»; типографика; свёрнутые по
   умолчанию состояния, доступность, селектор и ссылка, ширина кадра, помощь. «Copy» у блока копирует его
   CSS, клик по строке — её объявление `свойство: var(--токен, запасное);`. Подсветка — только
   токенами ДС (panel.css, pp-hl). Панель только показывает: правки вёрстки из неё нет.
   Тексты — strings.js.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  var M = PP && PP._measure;
  if (!PP || !PP._zoom || !PP._inspect || !PP._strings || !PP._props || !PP._states || !PP._a11y || !M) return;
  var t = PP._strings.t;
  var I = PP._inspect, Z = PP._zoom, P = PP._props, S = PP._states, A = PP._a11y;
  var host = null, copies = [], media = [], mediaMax = 12;
  /* Секции, открытые по умолчанию; остальные свёрнуты, пока человек их не раскроет. */
  var OPEN = { id: true, box: true, css: true, colors: true, type: true, media: true };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function prefs() { return PP._store && PP._store.prefs ? PP._store.prefs() : {}; }
  function setPref(k, v) { if (PP._store && PP._store.setPref) PP._store.setPref(k, v); }
  function view() { return prefs().devView === 'list' ? 'list' : 'code'; }
  function isOpen(id) { var f = prefs().devFolds; return f && id in f ? !!f[id] : !!OPEN[id]; }
  function setOpen(id, on) { var f = {}, cur = prefs().devFolds || {}; for (var k in cur) f[k] = cur[k]; f[id] = on; setPref('devFolds', f); }

  function row(label, value) {
    return '<div class="rof"><span class="ds-label"><span class="ds-label__text">' + esc(label) + '</span></span>'
      + '<div class="rof__row"><span class="rof__value">' + esc(value) + '</span></div></div>';
  }
  function iconBtn(act, icon, label, opts) {
    opts = opts || {};
    return '<button type="button" class="ibtn ibtn--neutral ibtn--s' + (opts.on ? ' ibtn--selected' : '') + '" data-pp-dev="' + act + '" aria-label="' + esc(label) + '" data-tooltip="' + esc(label) + '"'
      + (opts.pressed != null ? ' aria-pressed="' + !!opts.on + '"' : '') + (opts.disabled ? ' disabled' : '') + '>'
      + (opts.glyph ? '<span class="pp-glyph pp-glyph--s">' + opts.glyph + '</span>' : '<i data-icon="' + icon + '"></i>') + '</button>';
  }
  function copyLink(text, label) {
    copies.push(text);
    return '<a href="#" role="button" class="link link--accent link--s" data-pp-copy="' + (copies.length - 1) + '">' + esc(label || t('dev.copy')) + '</a>';
  }
  function link(href, label) {
    return href ? '<a class="link link--accent link--s" href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(label) + '</a>' : '';
  }

  /** Секция панели: заголовок-переключатель, действия справа, тело. Свёрнутая секция тело не строит. */
  function section(id, title, acts, body) {
    var open = isOpen(id);
    return '<section class="pp-ds" data-pp-sec="' + id + '">'
      + '<div class="pp-ds__head"><button type="button" class="pp-ds__toggle" data-pp-fold="' + id + '" aria-expanded="' + open + '">'
      + '<span class="pp-ds__chev" aria-hidden="true"><i data-icon="chevron-down"></i></span><span class="ds-body-s-strong">' + esc(title) + '</span></button>'
      + (open && acts ? '<span class="pp-ds__acts">' + (typeof acts === 'function' ? acts() : acts) + '</span>' : '') + '</div>'
      + (open ? '<div class="pp-ds__body">' + (typeof body === 'function' ? body() : body) + '</div>' : '')
      + '</section>';
  }
  /** Сегмент-контрол ДС (.segctrl): items — [{ text, on, attr }]; оживляет DSTabs.segment в PP._ui.wire. */
  function segment(label, items) {
    return '<div class="segctrl segctrl--s segctrl--fullwidth" role="radiogroup" aria-label="' + esc(label) + '" data-segctrl><div class="segctrl__thumb"></div>'
      + items.map(function (i) {
        return '<button type="button" class="segctrl__item" role="radio" aria-checked="' + !!i.on + '" tabindex="' + (i.on ? 0 : -1) + '" ' + i.attr + '><span class="segctrl__label">' + esc(i.text) + '</span></button>';
      }).join('') + '</div>';
  }
  function note(text, warn) { return '<p class="ds-body-xs pp-note ' + (warn ? 'pp-warn' : 'pp-muted') + '">' + esc(text) + '</p>'; }

  /* ---------------- подсветка кода ---------------- */

  /** Значение CSS: var(--токен — имя токена, знаки — приглушённо, остальное — значение. */
  function hlValue(v) {
    return String(v).split(/(var\(--[A-Za-z0-9_-]+)/).map(function (p, i) {
      if (i % 2) return '<span class="pp-hl__p">var(</span><span class="pp-hl__t">' + esc(p.slice(4)) + '</span>';
      return p.split(/([,()])/).map(function (q, j) {
        if (!q) return '';
        return j % 2 ? '<span class="pp-hl__p">' + esc(q) + '</span>' : '<span class="pp-hl__v">' + esc(q) + '</span>';
      }).join('');
    }).join('');
  }
  /** Объявление `свойство: значение;` с подсветкой. */
  function hlDecl(css) {
    var m = /^([^:]+):\s*([\s\S]*?);?\s*$/.exec(String(css));
    if (!m) return '<span class="pp-hl__v">' + esc(css) + '</span>';
    return '<span class="pp-hl__k">' + esc(m[1]) + '</span><span class="pp-hl__p">: </span>' + hlValue(m[2]) + '<span class="pp-hl__p">;</span>';
  }
  function hlComment(text) { return '<span class="pp-hl__c">/* ' + esc(text) + ' */</span>'; }

  /** HTML с подсветкой: теги, атрибуты, значения атрибутов, текст. */
  function hlHtml(src) {
    var out = '', re = /<(\/?)([A-Za-z][\w-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/g, last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      var attrs = m[3].replace(/([^\s=]+)(\s*=\s*)?("[^"]*"|'[^']*'|[^\s>]+)?/g, function (all, name, eq, val) {
        return '<span class="pp-hl__a">' + esc(name) + '</span>' + (eq ? '<span class="pp-hl__p">' + esc(eq) + '</span><span class="pp-hl__v">' + esc(val || '') + '</span>' : '');
      });
      out += '<span class="pp-hl__p">&lt;' + m[1] + '</span><span class="pp-hl__tag">' + esc(m[2]) + '</span>' + attrs + '<span class="pp-hl__p">' + m[4] + '&gt;</span>';
      last = re.lastIndex;
    }
    return out + esc(src.slice(last));
  }

  /* ---------------- кто элемент ---------------- */

  function tags(list, cls) {
    return list.length ? '<div class="pp-tags">' + list.map(function (x) { return '<span class="pp-tag ds-body-xs' + (cls ? ' ' + cls : '') + '">' + esc(x) + '</span>'; }).join('') + '</div>' : '';
  }

  /** Адреса паспорта и витрины виджета по пути метки сборщика: паспорт — рядом с разметкой, витрина — в apps/local-components. */
  function widgetLinks(w) {
    if (!w.src) return '';
    var url;
    try { url = new URL(w.src, window.location.href); } catch (e) { return ''; }
    var path = url.pathname, name = w.name;
    var out = link(url.href.replace(/\.html?$/i, '.md'), t('id.passport')) + link(url.href, t('id.source'));
    var m = /^(.*\/apps\/)([^/]+)\/([^/]+)\/widgets\/[^/]+\/[^/]+\/[^/]+\.html?$/i.exec(path);
    if (m && m[3] !== 'drafts') out += link(url.origin + m[1] + 'local-components/' + m[2] + '/' + m[3] + '/' + name + '.doc.html', t('id.showcase'));
    return out;
  }

  function kindOf(id) { return id.widget ? t('id.widget') : id.icon ? t('id.icon') : id.illu ? t('id.illu') : id.ds ? t('id.ds') : t('id.plain'); }

  function crumbsHtml(el) {
    var crumbs = M.crumbs(el), cut = Math.max(0, crumbs.length - 6);
    return '<nav class="pp-crumbs" aria-label="' + esc(t('insp.crumbs')) + '">' + (cut ? '<span class="ds-body-xs pp-muted">…</span><span class="ds-body-xs pp-muted" aria-hidden="true">›</span>' : '')
      + crumbs.slice(cut).map(function (c, i, all) {
        var last = i === all.length - 1;
        return last ? '<span class="ds-body-xs pp-crumb pp-crumb--current" aria-current="true">' + esc(c.name) + '</span>'
          : '<a href="#" role="button" class="link link--muted link--s pp-crumb" data-pp-dev="crumb:' + (cut + i) + '">' + esc(c.name) + '</a>';
      }).join('<span class="ds-body-xs pp-muted" aria-hidden="true">›</span>') + '</nav>';
  }

  function identity(el, d) {
    var id = d.identity, lines = [], links = '';
    if (id.ui) lines.push(t('id.ui') + ': ' + id.ui);
    if (id.widget && id.ds) lines.push(t('id.ds') + ': ' + id.ds.name + (id.ds.role === 'part' ? ' › ' + id.ds.part : ''));
    if (!id.widget && id.ds && id.ds.role === 'part') lines.push(t('id.partOf', { name: id.ds.name }));
    if (id.ds && id.ds.others.length) lines.push(t('id.also') + ': ' + id.ds.others.map(function (o) { return o.name + (o.mods.length ? ' (' + o.mods.join(', ') + ')' : ''); }).join(', '));
    var ctx = [];
    if (id.context.widget && !(id.widget && id.widget.name === id.context.widget.name)) ctx.push(id.context.widget.name);
    if (id.context.ds && !(id.ds && id.ds.role === 'root' && id.ds.name === id.context.ds.name)) ctx.push(id.context.ds.name);
    if (ctx.length) lines.push(t('id.inside') + ': ' + ctx.join(' › '));
    if (id.widget) links += widgetLinks(id.widget);
    if (id.ds) links += link(id.ds.page, t('id.docs')) + link(id.ds.spec, t('id.spec'));
    if (id.icon) links += copyLink(id.icon, t('id.copyName'));
    var nav = '<div class="pp-dnav" role="group" aria-label="' + esc(t('insp.navGroup')) + '">'
      + iconBtn('go:parent', 'arrow-up', t('insp.parent') + ' (↑)', { disabled: !M.nav(el, 'parent') })
      + iconBtn('go:child', 'arrow-down', t('insp.child') + ' (↓)', { disabled: !M.nav(el, 'child') })
      + iconBtn('go:prev', 'arrow-left', t('insp.prev') + ' (←)', { disabled: !M.nav(el, 'prev') })
      + iconBtn('go:next', 'arrow-right', t('insp.next') + ' (→)', { disabled: !M.nav(el, 'next') })
      + iconBtn('clear', 'close', t('insp.clear') + ' (Esc)') + '</div>';
    return '<div class="pp-did">'
      + '<div class="pp-did__top"><div class="pp-did__name"><p class="ds-body-m-strong pp-subtitle">' + esc(d.title) + '</p>'
      + '<p class="ds-body-xs pp-muted pp-note">' + esc(kindOf(id) + (id.widget && id.widget.group ? ' · ' + id.widget.group : '')) + '</p></div>' + nav + '</div>'
      + lines.map(function (x) { return '<p class="ds-body-xs pp-muted pp-note">' + esc(x) + '</p>'; }).join('')
      + (id.ds && id.ds.mods.length ? tags(id.ds.mods, '') : '')
      + (id.states.length ? tags(id.states, 'pp-tag--state') : '')
      + (links ? '<div class="pp-row pp-links">' + links + '</div>' : '')
      + crumbsHtml(el) + '</div>';
  }

  /** Box model: margin — плашками на выносных линиях, border — рамка с радиусами в углах, padding — залитый
      прямоугольник, размер — в пунктирной рамке. Число — кнопка: клик копирует объявление стороны или угла,
      подсказка — имя токена. Нулевое значение — «–» (радиус — «0»), margin нуля не рисуется. */
  function boxModel(b) {
    var SIDES = ['t', 'r', 'b', 'l'], NAMES = { t: 'top', r: 'right', b: 'bottom', l: 'left' };
    var CORNERS = ['tl', 'tr', 'br', 'bl'], CNAMES = { tl: 'top-left', tr: 'top-right', br: 'bottom-right', bl: 'bottom-left' };
    function tip(r) { return r && r.token ? (r.exact ? '' : '≈ ') + r.token + ' · ' + r.value : ''; }
    /** Число-кнопка: css — объявление для копии (пусто — число не копируется), title — подсказка. */
    function num(cls, text, css, title, zero) {
      var cls2 = 'pp-bm__n ' + cls + (zero ? ' pp-muted' : '') + ' ds-body-xs';
      if (!css) return '<span class="' + cls2 + '">' + esc(text) + '</span>';
      copies.push(css);
      return '<button type="button" class="' + cls2 + '" data-pp-copy="' + (copies.length - 1) + '" title="' + esc(title || t('dev.copyRow')) + '">' + esc(text) + '</button>';
    }
    function side(kind, s, i, vals, toks, prop) {
      var v = vals[s], r = toks && toks[i];
      var css = v || r && r.token ? prop(s, r, v) : '';
      return num('pp-bm__n--' + kind + s, v ? M.fmt(v) : '–', css, tip(r), !v);
    }
    function decl(pre, post) {
      return function (s, r, v) { return pre + '-' + NAMES[s] + (post ? '-' + post : '') + ': ' + (r && r.token ? 'var(' + r.token + ', ' + M.fmt(v) + 'px)' : M.fmt(v) + 'px') + ';'; };
    }
    var mg = SIDES.map(function (s, i) {
      return b.m[s] ? '<span class="pp-bm__m pp-bm__m--' + s + '">' + side('m', s, i, b.m, b.tm, decl('margin')) + '</span>' : '';
    });
    var bd = SIDES.map(function (s) { return side('b', s, 0, b.b, null, decl('border', 'width')); });
    var pd = SIDES.map(function (s, i) { return side('p', s, i, b.p, b.tp, decl('padding')); });
    var rad = CORNERS.map(function (c, i) {
      var r = b.r[i], v = M.num(r.value || r.raw);
      return num('pp-bm__r pp-bm__r--' + c, M.fmt(v), v || r.token ? 'border-' + CNAMES[c] + '-radius: ' + (r.token ? 'var(' + r.token + ', ' + M.fmt(v) + 'px)' : M.fmt(v) + 'px') + ';' : '', tip(r), !v);
    });
    var vars = CORNERS.map(function (c, i) { return '--r-' + c + ':' + M.fmt(M.num(b.r[i].value || b.r[i].raw)) + 'px'; }).join(';');
    var core = '<div class="pp-bm__c ds-body-xs">' + esc(M.fmt(b.w) + ' × ' + M.fmt(b.h)) + '</div>';
    var padding = '<div class="pp-bm__p"><span class="pp-bm__cap pp-bm__cap--p ds-body-xs">' + esc(t('box.padding')) + pd[0] + '</span>'
      + pd[3] + core + pd[1] + pd[2] + '</div>';
    var border = '<div class="pp-bm__b" style="' + vars + '"><span class="pp-bm__cap pp-bm__cap--b ds-body-xs">' + esc(t('box.border')) + bd[0] + '</span>'
      + rad.join('') + bd[3] + padding + bd[1] + bd[2] + '</div>';
    return '<div class="pp-bm" role="group" aria-label="' + esc(t('box.title')) + '">'
      + '<div class="pp-bm__fr">' + mg[0] + mg[3] + border + mg[1] + mg[2] + '</div>'
      + '<p class="ds-body-xs pp-muted pp-bm__s">' + esc(b.sizing) + '</p></div>';
  }

  /* ---------------- свойства: код или список ---------------- */

  function partHtml(p) {
    var h = '';
    if (p.token) h += '<span class="pp-tok' + (p.exact ? '' : ' pp-tok--guess') + '">' + (p.exact ? '' : '≈ ') + esc(p.token) + '</span>';
    h += '<span class="pp-val' + (p.token ? ' pp-muted' : '') + '">' + esc(p.text) + '</span>';
    return '<span class="pp-vp">' + h + '</span>';
  }
  function guessed(r) { return r.parts.some(function (p) { return p.token && !p.exact; }); }

  function propRow(r) {
    var also = [], live = !!r.css;   // строка без объявления (как «Focus» в доступности) не копируется
    if (live) copies.push(r.css);
    r.parts.forEach(function (p) { if (p.also && p.also.length) also.push(t('tok.also') + ' ' + p.also.join(', ')); });
    var sw = r.swatch ? '<span class="pp-sw" style="--pp-sw:' + esc(r.swatch) + '" aria-hidden="true"></span>' : '';
    return (live ? '<button type="button" class="pp-prop" data-pp-copy="' + (copies.length - 1) + '" title="' + esc(t('dev.copyRow')) + '">' : '<div class="pp-prop pp-prop--static">')
      + '<span class="pp-prop__k ds-body-s pp-muted">' + esc(r.k) + '</span>'
      + '<span class="pp-prop__v ds-body-s">' + sw + r.parts.map(partHtml).join('')
      + (also.length ? '<span class="pp-also ds-body-xs pp-muted">' + esc(also.filter(function (x, i) { return also.indexOf(x) === i; }).join(' · ')) + '</span>' : '')
      + '</span>' + (live ? '</button>' : '</div>');
  }

  /** Строка кода: объявление с подсветкой; не входящее в копию блока (размер Hug / Fill, части шрифта
      при токене типографики) — комментарием; имя токена по значению — пометкой ≈ в конце. Клик — копия строки. */
  function codeLine(r) {
    if (!r.css) return '';
    copies.push(r.css);
    var also = [];
    r.parts.forEach(function (p) { if (p.also && p.also.length) also = also.concat(p.also); });
    var body = r.noBlock ? hlComment(String(r.css).replace(/;\s*$/, '') + (r.parts[0] && /^(Fill|Hug|Fixed)\b/.test(r.parts[0].text) ? ' · ' + r.parts[0].text.split(' ')[0] : ''))
      : hlDecl(r.css) + (guessed(r) ? ' ' + hlComment('≈') : '');
    var tip = t('dev.copyRow') + (guessed(r) ? ' · ≈ ' + t('tok.byValue') + (also.length ? ' · ' + t('tok.also') + ' ' + also.join(', ') : '') : '');
    return '<button type="button" class="pp-ln" data-pp-copy="' + (copies.length - 1) + '" title="' + esc(tip) + '">' + body + '</button>';
  }

  /** Блок свойств: подзаголовок с «Copy» и строки кодом или списком. */
  function propBlock(title, rows) {
    if (!rows.length) return '';
    var css = P.blockCss(rows);
    var head = '<div class="pp-sub"><span class="ds-body-xs pp-muted">' + esc(title) + '</span>' + (css ? copyLink(css) : '') + '</div>';
    if (view() === 'list') return '<div class="pp-blk">' + head + '<div class="pp-props">' + rows.map(propRow).join('') + '</div></div>';
    return '<div class="pp-blk">' + head + '<div class="pp-codebox ds-body-xs">' + rows.map(codeLine).join('') + '</div></div>';
  }

  function viewSwitch() {
    var v = view();
    return '<span class="pp-dview" role="group" aria-label="' + esc(t('dev.view')) + '">'
      + iconBtn('view:code', '', t('dev.viewCode'), { on: v === 'code', pressed: true, glyph: PP._ui && PP._ui.glyph ? PP._ui.glyph('code') : '' })
      + iconBtn('view:list', 'list-view-01', t('dev.viewList'), { on: v === 'list', pressed: true }) + '</span>';
  }

  /** Цвета: группа (заливка, текст, обводка), образец, имя токена, hex справа. Клик по токену — имя токена, по hex — цвет. */
  function colorsBody(rows) {
    /* Клик по токену копирует имя токена, по hex — цвет: каждое отдельно */
    function copyBtn(text, cls, tip, inner) {
      copies.push(text);
      return '<button type="button" class="pp-color__btn ' + cls + '" data-pp-copy="' + (copies.length - 1) + '" title="' + esc(tip) + '">' + inner + '</button>';
    }
    return '<div class="pp-colors">' + rows.map(function (r) {
      var p = r.parts[0] || { text: '', token: '' };
      var sw = '<span class="pp-sw pp-sw--round" style="--pp-sw:' + esc(r.swatch) + '" aria-hidden="true"></span>';
      var tok = '<span class="pp-color__tok ds-body-s' + (p.token && !p.exact ? ' pp-tok--guess' : '') + '">' + esc(p.token ? (p.exact ? '' : '≈ ') + p.token : t('tok.none')) + '</span>';
      return '<div class="pp-color"><span class="ds-body-xs pp-muted">' + esc(r.k) + '</span><div class="pp-color__row">'
        + (p.token ? copyBtn(p.token, 'pp-color__btn--tok', t('dev.copyToken'), sw + tok) : '<span class="pp-color__btn pp-color__btn--tok">' + sw + tok + '</span>')
        + copyBtn(p.text, 'pp-color__btn--hex', t('dev.copyColor'), '<span class="pp-color__hex ds-body-s pp-muted">' + esc(p.text) + '</span>') + '</div></div>';
    }).join('') + '</div>';
  }

  /* ---------------- свёрнутые секции ---------------- */

  /** Состояния ДС: переключатели .is-* для выбранного элемента (dev-states.js). */
  /** Состояния, которые есть у элемента: по таблицам стилей (localhost) — описанные ДС; по file:// таблицы закрыты —
      все пять, но только компонентам ДС и управляющим элементам. Нет ни одного — null (секции States нет). */
  function stateList(el, d) {
    var map = S.available(el);
    if (map) { var l = S.LIST.filter(function (s) { return map[s] || S.isOn(el, s); }); return l.length ? l : null; }
    return d.identity.ds || el.matches('button, a[href], input, select, textarea, [role="button"], [tabindex]') ? S.LIST.slice() : null;
  }
  /** Состояния — сегмент-контрол «Default | Hover | …»: одно значение за раз. */
  function statesBody(el, d, list) {
    var forced = S.forced(el), map = S.available(el);
    var cur = forced[0] || list.filter(function (s) { return S.isOn(el, s); })[0] || 'default';
    var items = ['default'].concat(list).map(function (s) { return { text: t('st.' + s), on: s === cur, attr: 'data-pp-dev="state:' + s + '"' }; });
    var links = d.identity.ds ? link(d.identity.ds.page, t('id.docs')) + link(d.identity.ds.spec, t('id.spec')) : '';
    return segment(t('st.title'), items)
      + note(!map ? t('st.unknown') : t('st.help'))
      + (links ? '<div class="pp-row pp-links">' + links + '</div>' : '');
  }

  function textRow(k, text, extra) {
    var r = { k: k, parts: [{ text: text, token: '', exact: false, also: [] }], css: text };
    if (extra) for (var n in extra) r[n] = extra[n];
    return r;
  }

  /** Доступность: роль, имя, фокус, aria, контраст (dev-a11y.js). */
  function a11yBody(el) {
    var a = A.build(el), rows = [], notes = [];
    var rl = a.role.role ? a.role.role + (a.role.level ? ' · ' + t('a11y.level', { n: a.role.level }) : '') + (a.role.explicit ? ' · ' + t('a11y.roleAttr') : '') : t('a11y.noRole');
    rows.push(textRow(t('a11y.role'), rl, { css: a.role.role || '' }));
    rows.push(textRow(t('a11y.name'), a.name.name ? '“' + a.name.name + '” · ' + t('a11y.src.' + a.name.source) : t('a11y.noName'), { css: a.name.name }));
    rows.push(textRow(t('a11y.focus'), a.disabled && !a.focus.yes ? t('a11y.disabled') : a.focus.yes ? t('a11y.focusable', { n: a.focus.tabindex }) : t('a11y.notFocusable'), { css: '' }));
    if (a.aria.length) rows.push(textRow(t('a11y.aria'), a.aria.join(' · '), { css: a.aria.join(' ') }));
    var c = a.contrast;
    if (c && c.unknown) rows.push(textRow(t('a11y.contrast'), t(c.unknown === 'image' ? 'a11y.unknownImage' : 'a11y.unknownColor') + (c.of ? ' · ' + t('a11y.of', { name: c.of }) : ''), { css: '' }));
    else if (c) {
      var rt = (Math.floor(c.ratio * 100) / 100).toFixed(2);
      rows.push(textRow(t('a11y.contrast'), rt + ' : 1 · ' + c.fg + ' / ' + c.bg + ' · ' + (c.ok ? t('a11y.pass') : t('a11y.fail') + ', ' + t('a11y.need', { n: c.need })) + ' · ' + (c.aaa ? t('a11y.aaa') : t('a11y.noAaa')) + (c.of ? ' · ' + t('a11y.of', { name: c.of }) : ''), { css: rt + ':1', swatch: c.fg }));
      if (c.assumed) notes.push(t('a11y.assumed'));
      if (c.faded) notes.push(t('a11y.faded'));
    }
    return '<div class="pp-props">' + rows.map(propRow).join('') + '</div>'
      + a.issues.map(function (i) { return note(t('a11y.i.' + i), true); }).join('')
      + notes.map(function (n) { return note(n); }).join('')
      + note(t('a11y.help'));
  }

  function htmlBody(el) {
    var c = P.code(el);
    var shown = c.html.length > 3000 ? c.html.slice(0, 3000) : c.html;
    return '<pre class="pp-codebox pp-codebox--pre pp-codeview ds-body-xs">' + hlHtml(shown) + (shown.length < c.html.length ? '\n…' : '') + '</pre>'
      + (shown.length < c.html.length ? note(t('code.more')) : '');
  }

  /** Ссылка на выбранный элемент: адрес страницы и #ppdev=<селектор>. */
  function elementLink(el) {
    return location.href.split('#')[0] + '#ppdev=' + encodeURIComponent(M.selector(el));
  }
  function selectorBody(el) {
    return '<p class="pp-codebox pp-codebox--pre ds-body-xs pp-selector">' + esc(M.selector(el)) + '</p>'
      + '<div class="pp-row">' + copyLink(elementLink(el), t('dev.linkCopy')) + '</div>' + note(t('dev.linkHelp'));
  }

  function widthBody() {
    var w = Z.width(), presets = [null].concat(Z.PRESETS);
    return segment(t('dev.width'), presets.map(function (v) { return { text: v ? v + ' px' : t('dev.widthFit'), on: v === w, attr: 'data-pp-width="' + (v || '') + '"' }; })) + note(t('dev.widthHelp'));
  }
  function helpBody() {
    return note(t('insp.modeHelp')) + note(t('insp.layoutHelp')) + note(t('tok.help'))
      + '<div class="pp-keys">'
      + row('V H G M C', t('insp.k.tools'))
      + row(t('dev.k.zoom'), t('dev.k.zoomText')) + row(t('dev.k.move'), t('dev.k.moveText'))
      + row('Ctrl+0', t('dev.k.reset')) + row('Shift+1', t('dev.k.fit'))
      + row('Shift', t('insp.k.shift')) + row('Alt', t('insp.k.alt')) + row('Click', t('insp.k.click'))
      + row('↑ ↓ ← →', t('insp.k.arrows')) + row('Tab · Enter', t('insp.k.tab')) + row('Esc', t('insp.k.esc'))
      + '</div>';
  }

  /* ---------------- медиа: иконки и иллюстрации внутри выбранного ---------------- */

  /** Иконки (data-icon) и иллюстрации (.illu[data-illu]) выбранного элемента и всего внутри него, без повторов (счётчик). Слои панели не берутся. */
  function mediaList(el) {
    var T = PP._tokens, out = [], seen = {};
    var nodes = [].slice.call(el.querySelectorAll('[data-icon], .illu[data-illu]'));
    if (el.matches && el.matches('[data-icon], .illu[data-illu]')) nodes.unshift(el);
    nodes.forEach(function (n) {
      if (M.own(n)) return;
      var item, key;
      if (n.hasAttribute('data-icon')) {
        var svg = n.querySelector('svg');
        if (!svg) return;
        var color = T && T.hex ? T.hex(getComputedStyle(n).color) : '';
        item = { kind: 'icon', name: n.getAttribute('data-icon'), color: color, svg: svg.outerHTML, n: 1 };
        key = 'i|' + item.name + '|' + color;
      } else {
        var img = n.querySelector('img');
        if (!img || !(img.currentSrc || img.src)) return;
        item = { kind: 'illu', name: n.getAttribute('data-illu'), src: img.currentSrc || img.src, n: 1 };
        key = 'u|' + item.src;
      }
      if (seen[key]) { seen[key].n++; return; }
      seen[key] = item;
      out.push(item);
    });
    return out;
  }
  /** Имя файла: иконка — `icon-<имя>.svg`, иллюстрация — как файл в ДС (с -dark, если подставлена тёмная). */
  function mediaFile(m) {
    if (m.kind === 'icon') return 'icon-' + m.name + '.svg';
    var base = '';
    try { base = decodeURIComponent(String(m.src).split(/[?#]/)[0].split('/').pop() || ''); } catch (e) { base = ''; }
    return base || m.name + '.svg';
  }
  function mediaCard(m, i) {
    var pic = m.kind === 'icon'
      ? '<i data-icon="' + esc(m.name) + '"' + (m.color ? ' data-pp-c="' + esc(m.color) + '"' : '') + '></i>'
      : '<img class="pp-media__img" alt="" draggable="false" src="' + esc(m.src) + '">';
    var meta = (m.kind === 'icon' ? t('media.icon') + (m.color ? ' · ' + m.color : '') : t('media.illu')) + (m.n > 1 ? ' · ×' + m.n : '');
    return '<button type="button" class="pp-media__card" data-pp-dl="' + i + '" title="' + esc(t('media.dl', { name: mediaFile(m) })) + '">'
      + '<span class="pp-media__pic">' + pic + '</span>'
      + '<span class="pp-media__name ds-body-xs">' + esc(m.name) + '</span>'
      + '<span class="pp-media__meta ds-body-xs pp-muted">' + esc(meta) + '</span>'
      + '<span class="pp-media__dl" aria-hidden="true"><i data-icon="download"></i></span></button>';
  }
  function mediaBody() {
    var shown = media.slice(0, mediaMax);
    return '<div class="pp-media">' + shown.map(mediaCard).join('') + '</div>'
      + (media.length > shown.length ? '<div class="pp-media__more"><a href="#" role="button" class="link link--accent link--s" data-pp-more="1">' + esc(t('media.more', { n: media.length - shown.length })) + '</a></div>' : '');
  }
  /** Скачать: иконка — SVG с цветом страницы вместо currentColor; иллюстрация — файл ДС (по file:// чтение закрыто — тогда открывается во вкладке). */
  function download(m) {
    var St = PP._store, U = PP._ui, name = mediaFile(m);
    if (!St || !St.downloadText) return;
    var done = function () { if (U && U.toast) U.toast(t('media.saved', { name: name }), 'success'); };
    if (m.kind === 'icon') {
      var s = m.svg.replace(/currentColor/gi, m.color || '#000000');
      if (!/\sxmlns=/.test(s.slice(0, 200))) s = s.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      St.downloadText(name, s, 'image/svg+xml'); done(); return;
    }
    var fallback = function () {
      var wrap = document.createElement('span'), a = document.createElement('a');
      wrap.className = 'pp-probe pp-hidden';   // «своя» обёртка: инспектор не гасит клик (см. store.downloadText)
      a.href = m.src; a.download = name; a.target = '_blank'; a.rel = 'noopener';
      wrap.appendChild(a); document.body.appendChild(wrap); a.click(); setTimeout(function () { wrap.remove(); }, 1000);
      if (U && U.toast) U.toast(t('media.fileProto'), 'info');
    };
    try {
      fetch(m.src).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (txt) { St.downloadText(name, txt, 'image/svg+xml'); done(); }, fallback);
    } catch (e) { fallback(); }
  }

  /* ---------------- панель целиком ---------------- */

  function selection() {
    var el = I.selected();
    if (!el) return '<section class="pp-ds pp-ds--empty"><p class="ds-body-s pp-muted pp-note">' + esc(t('insp.hint')) + '</p></section>';
    var d = P.build(el);
    var isGuess = [d.layout, d.style, d.colors, d.type].some(function (rows) { return rows.some(guessed); });
    var tokNotes = (d.readable ? '' : note(t('tok.closed'))) + (isGuess ? note(t('tok.guess')) : '');
    media = mediaList(el);
    return section('id', t('dev.sec.element'), '', function () { return identity(el, d); })
      + section('box', t('box.title'), '', function () { return boxModel(d.box); })
      + section('css', t('dev.sec.css'), viewSwitch(), function () { return propBlock(t('css.layout'), d.layout) + propBlock(t('css.style'), d.style) + tokNotes; })
      + section('html', t('css.code'), function () { return copyLink(P.code(el).html); }, function () { return htmlBody(el); })
      + (d.colors.length ? section('colors', t('css.colors'), '', function () { return colorsBody(d.colors); }) : '')
      + (d.type.length ? section('type', t('css.type'), function () { return P.blockCss(d.type) ? copyLink(P.blockCss(d.type)) : ''; }, function () { return view() === 'list' ? '<div class="pp-props">' + d.type.map(propRow).join('') + '</div>' : '<div class="pp-codebox ds-body-xs">' + d.type.map(codeLine).join('') + '</div>'; }) : '')
      + (media.length ? section('media', t('dev.sec.media'), '<span class="ds-body-xs pp-muted">' + media.length + '</span>', mediaBody) : '')
      + (stateList(el, d) ? section('states', t('st.title'), '', function () { return statesBody(el, d, stateList(el, d)); }) : '')
      + section('a11y', t('a11y.title'), '', function () { return a11yBody(el); })
      + section('selector', t('dev.sec.link'), function () { return copyLink(M.selector(el)); }, function () { return selectorBody(el); });
  }

  function html() {
    copies = [];
    return selection()
      + section('width', t('dev.width'), '', widthBody)
      + section('help', t('dev.help'), '', helpBody);
  }

  function copy(text) {
    var St = PP._store, U = PP._ui;
    if (!St || !St.copyText) return;
    St.copyText(text).then(function () { if (U && U.toast) U.toast(t('dev.copied'), 'success'); }, function () { if (U && U.toast) U.toast(t('dev.copyFail'), 'error'); });
  }

  function onClick(e) {
    var c = e.target.closest && e.target.closest('[data-pp-copy]');
    if (c) { e.preventDefault(); var v = copies[parseInt(c.getAttribute('data-pp-copy'), 10)]; if (v != null) copy(v); return; }
    var dl = e.target.closest && e.target.closest('[data-pp-dl]');
    if (dl) { e.preventDefault(); var m = media[parseInt(dl.getAttribute('data-pp-dl'), 10)]; if (m) download(m); return; }
    var more = e.target.closest && e.target.closest('[data-pp-more]');
    if (more) { e.preventDefault(); mediaMax += 24; render(host); return; }
    var f = e.target.closest && e.target.closest('[data-pp-fold]');
    if (f) { setOpen(f.getAttribute('data-pp-fold'), f.getAttribute('aria-expanded') !== 'true'); render(host); return; }
    var w = e.target.closest && e.target.closest('[data-pp-width]');
    if (w) { if (Z.active()) { Z.setWidth(parseInt(w.getAttribute('data-pp-width'), 10) || null); render(host); } return; }
    var b = e.target.closest && e.target.closest('[data-pp-dev]');
    if (!b || b.disabled) return;
    e.preventDefault();
    var a = b.getAttribute('data-pp-dev'), p = a.split(':');
    if (p[0] === 'go') I.go(p[1]);
    else if (p[0] === 'clear') I.select(null);
    else if (p[0] === 'view') { setPref('devView', p[1]); render(host); }
    else if (p[0] === 'state') { if (I.selected()) S.set(I.selected(), p[1] === 'default' ? '' : p[1]); }
    else if (p[0] === 'crumb') { var cr = M.crumbs(I.selected()); if (cr[+p[1]]) I.select(cr[+p[1]].el); }
  }

  /** Перерисовать панель; фокус остаётся на той же кнопке, прокрутка — на месте. */
  function render(box) {
    if (!box) return;
    host = box;
    var ae = document.activeElement && box.contains(document.activeElement) ? document.activeElement : null;
    var key = ae ? ['data-pp-dev', 'data-pp-width', 'data-pp-fold', 'data-pp-dl', 'data-pp-more'].filter(function (k) { return ae.hasAttribute(k); })[0] || '' : '';
    var val = key ? ae.getAttribute(key) : '';
    var scroller = box.closest ? box.closest('.drawer__body') || box : box, top = scroller.scrollTop;
    box.innerHTML = html();
    box.onclick = onClick;
    if (PP._ui && PP._ui.wire) PP._ui.wire(box);
    [].forEach.call(box.querySelectorAll('[data-pp-c]'), function (n) { n.style.color = n.getAttribute('data-pp-c'); });
    scroller.scrollTop = top;
    if (key) { var again = box.querySelector('[' + key + '="' + val + '"]'); if (again && !again.disabled) again.focus(); }
  }

  /* Выбор, режим и переключатели меняют панель; наведение — нет (иначе перерисовка на каждое движение). */
  I.onChange(function () { mediaMax = 12; if (host && host.isConnected && !host.hidden) render(host); });
  S.onChange(function () { if (host && host.isConnected && !host.hidden) render(host); });

  /* ---------------- адрес выбранного элемента: #ppdev=<селектор> ---------------- */

  /** Адрес с #ppdev= (после загрузки страницы): включает Devmode и выбирает элемент; хеш снимается.
      Не нашли элемент — Devmode всё равно открыт, в уведомлении сказано, чего нет. */
  function fromHash() {
    var m = /(?:^#|&)ppdev=([^&]*)/.exec(location.hash || '');
    if (!m) return false;
    var rest = (location.hash || '').replace(/^#/, '').split('&').filter(function (x) { return x && x.indexOf('ppdev=') !== 0; });
    try { history.replaceState(history.state, '', location.pathname + location.search + (rest.length ? '#' + rest.join('&') : '')); } catch (e) { /* адрес остаётся как есть */ }
    var sel = '';
    try { sel = decodeURIComponent(m[1]); } catch (e) { sel = m[1]; }
    var U = PP._ui;
    if (U && U.setDev) U.setDev(true);
    if (!I.active()) return false;
    var el = null;
    try { el = sel ? document.querySelector(sel) : null; } catch (e) { el = null; }
    if (el && !M.own(el)) I.select(el);
    else if (U && U.toast) U.toast(t('dev.linkMiss', { sel: sel }), 'error');
    return true;
  }

  /* Та же страница, другой хеш — документ не перезагружается (ссылка вставлена в адресную строку открытой страницы). */
  window.addEventListener('hashchange', function () { if (/(?:^#|&)ppdev=/.test(location.hash || '')) fromHash(); });

  PP._devPane = { render: render, fromHash: fromHash };
})();
