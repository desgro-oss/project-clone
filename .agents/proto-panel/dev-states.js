/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — состояния выбранного элемента (dev-states.js, RE0030, Э6).

   Принудительные состояния ДС: классы .is-hover, .is-focus, .is-pressed,
   .is-active, .is-disabled. Страница сразу показывает результат, а блоки CSS
   панели читают стили уже в этом состоянии. Ставятся только на выбранный
   элемент, по одному набору за раз; снимаются при смене и снятии выбора, при
   выходе из Devmode и при уходе со страницы. Класс, который уже стоял на
   странице (например, .is-active у выбранной вкладки), панель после снятия
   возвращает. Какие состояния компонент описывает — по таблицам стилей, если
   их можно прочитать (localhost); по file:// таблицы ДС закрыты — тогда
   доступны все пять (панель при этом предлагает их только компонентам ДС и управляющим элементам). Страницу не правит, кроме этих классов. Тексты — strings.js.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  var I = PP && PP._inspect, T = PP && PP._tokens;
  if (!PP || !I || !T) return;

  var LIST = ['hover', 'focus', 'pressed', 'active', 'disabled'];
  var held = null;           // { el, added: [состояния, поставленные панелью], removed: [состояния, снятые панелью] }
  var avail = null;          // { el, map }: кэш «какие состояния описаны» для выбранного элемента
  var subs = [], settleId = 0;

  function cls(s) { return 'is-' + s; }
  function fire() { subs.forEach(function (fn) { try { fn(); } catch (e) { /* слушатель панели не должен ломать состояния */ } }); }

  /** Последняя составная часть селектора (после последнего комбинатора вне скобок). */
  function lastCompound(sel) {
    var depth = 0, cut = 0;
    for (var i = 0; i < sel.length; i++) {
      var ch = sel[i];
      if (ch === '(' || ch === '[') depth++;
      else if (ch === ')' || ch === ']') depth--;
      else if (depth === 0 && /[\s>+~]/.test(ch)) cut = i + 1;
    }
    return sel.slice(cut);
  }
  function splitList(text) {
    var out = [], depth = 0, cur = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === '(' || ch === '[') depth++;
      else if (ch === ')' || ch === ']') depth--;
      if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }

  /** Какие состояния описывает ДС для элемента: { hover: true, … } или null, если таблицы закрыты. */
  function available(el) {
    if (avail && avail.el === el) return avail.map;
    var map = null;
    if (T.readable()) {
      map = {};
      var want = LIST.map(function (s) { return { s: s, c: '.' + cls(s) }; });
      var walk = function (rules) {
        for (var i = 0; i < rules.length; i++) {
          var r = rules[i];
          if (r.selectorText && r.style) {
            var txt = r.selectorText;
            for (var k = 0; k < want.length; k++) {
              if (map[want[k].s] || txt.indexOf(want[k].c) < 0) continue;
              splitList(txt).forEach(function (part) {
                if (map[want[k].s] || lastCompound(part).indexOf(want[k].c) < 0) return;
                try { if (el.matches(part.split(want[k].c).join(':not(.pp-none)'))) map[want[k].s] = true; } catch (e) { /* селектор вне поддержки */ }
              });
            }
          } else if (r.styleSheet) {
            try { walk(r.styleSheet.cssRules); } catch (e) { /* чужая таблица закрыта */ }
          } else if (r.cssRules && r.cssRules.length) walk(r.cssRules);
        }
      };
      for (var s = 0; s < document.styleSheets.length; s++) {
        try { walk(document.styleSheets[s].cssRules); } catch (e) { /* таблица закрыта */ }
      }
    }
    avail = { el: el, map: map };
    return map;
  }

  /** Стоит ли состояние на элементе сейчас (панелью или страницей). */
  function isOn(el, s) { return !!(el && el.classList && el.classList.contains(cls(s))); }
  /** Состояния, поставленные панелью. */
  function forced(el) { return held && held.el === el ? held.added.slice() : []; }

  function clear(quiet) {
    if (!held) return;
    var h = held;
    held = null;
    settleId++;
    if (h.el && h.el.classList) {
      h.added.forEach(function (s) { h.el.classList.remove(cls(s)); });
      h.removed.forEach(function (s) { h.el.classList.add(cls(s)); });
      if (!h.el.classList.length && h.el.hasAttribute('class') && !h.el.getAttribute('class')) h.el.removeAttribute('class');
    }
    if (!quiet) fire();
  }

  /** Подождать, пока переходы и анимации выбранного элемента закончатся, и дать панели перечитать стили. */
  function settle(el) {
    var id = ++settleId;
    var done = function () { if (id === settleId && held && held.el === el) fire(); };
    var anims = [];
    try { anims = el.getAnimations ? el.getAnimations() : []; } catch (e) { anims = []; }
    if (!anims.length) return;
    Promise.all(anims.map(function (a) { return a.finished.catch(function () { /* отменена */ }); })).then(done, done);
    setTimeout(done, 600);   // запасной срок: finished не всегда приходит
  }

  /** Переключить состояние выбранного элемента; на другом элементе прежние снимаются. */
  function toggle(el, s) {
    if (!el || LIST.indexOf(s) < 0) return false;
    if (held && held.el !== el) clear(true);
    if (!held) held = { el: el, added: [], removed: [] };
    var c = cls(s), i;
    if (el.classList.contains(c)) {
      el.classList.remove(c);
      if ((i = held.added.indexOf(s)) >= 0) held.added.splice(i, 1);
      else held.removed.push(s);
    } else {
      el.classList.add(c);
      if ((i = held.removed.indexOf(s)) >= 0) held.removed.splice(i, 1);
      else held.added.push(s);
    }
    if (!held.added.length && !held.removed.length) held = null;
    fire();
    settle(el);
    return true;
  }

  /** Одно состояние за раз (сегмент-контрол): поставленные панелью другие снимаются, '' — снять все. Состояние, которое
      уже стоит на странице само, не трогаем. */
  function set(el, s) {
    if (!el) return;
    if (held && held.el === el) held.added.slice().forEach(function (x) { if (x !== s) toggle(el, x); });
    if (s && LIST.indexOf(s) >= 0 && !isOn(el, s)) toggle(el, s);
  }

  /** Привести клон разметки к виду без вмешательства панели: поставленные ею классы снять, снятые вернуть. */
  function unforce(copy, el) {
    if (!held || held.el !== el || !copy || !copy.classList) return;
    held.added.forEach(function (s) { copy.classList.remove(cls(s)); });
    held.removed.forEach(function (s) { copy.classList.add(cls(s)); });
  }

  /* Выбор сменился или снят — состояния прежнего элемента снимаются; уход со страницы — тоже. */
  I.onChange(function () { if (held && I.selected() !== held.el) clear(); if (avail && avail.el !== I.selected()) avail = null; });
  window.addEventListener('pagehide', function () { clear(true); });

  PP._states = {
    LIST: LIST, available: available, isOn: isOn, forced: forced, toggle: toggle, set: set, clear: clear, unforce: unforce,
    held: function () { return !!held; },
    onChange: function (fn) { subs.push(fn); }
  };
})();
