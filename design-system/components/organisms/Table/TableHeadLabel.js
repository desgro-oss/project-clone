/* ============================================================
   TableHeadLabel.js — подпись шапки колонки (.th__label) без разрыва
   слова (TableCell 2.028, решение человека 30.10.2026).

   CSS переносит подпись только между словами, не больше двух строк
   (line-clamp 2). Два случая CSS не различает — их решает этот рантайм:

   1. Слово шире колонки. Перенос по словам его не разорвёт, а просто
      обрежет без многоточия. Тогда подпись — одна строка с многоточием:
      класс .th__label--line.
   2. Перед многоточием осталась бы одна буква («Д…»). Тогда видно только
      «…»: класс .th__label--dots. Текст остаётся в DOM — его читают
      скринридер и тултип усечения (DSTooltip.truncated в Table.js).

   У колонки действий (.th--actions) подпись всегда в одну строку — это
   делает CSS; рантайм для неё решает только случай 2.

   Пересчёт — при изменении ширины шапки (ResizeObserver на .th: ресайз
   колонки, окно, «Настройка таблицы»), после загрузки шрифтов и для
   шапок, которые экран дорисовал позже (MutationObserver).

   Делегирования нет: рантайм сам находит все .th__label на странице.
   Экспорт: window.DSTableHeadLabel = { fit(label), refresh(root) }.
   ============================================================ */
(function () {
  'use strict';

  var ctx = null;
  function measure(text, font) {
    if (!ctx) ctx = document.createElement('canvas').getContext('2d');
    ctx.font = font;
    return ctx.measureText(text).width;
  }

  /* текст подписи мимо тултипа, который ds-tooltip может положить внутрь */
  function textOf(el) {
    var out = '';
    Array.prototype.forEach.call(el.childNodes, function (n) {
      if (n.nodeType === 3) { out += n.nodeValue; return; }
      if (n.nodeType !== 1 || n.getAttribute('role') === 'tooltip') return;
      out += n.textContent;
    });
    return out.replace(/\s+/g, ' ').trim();
  }

  function fit(label) {
    var text = textOf(label);
    var avail = label.clientWidth;
    if (!text || !avail) return;
    var cs = getComputedStyle(label);
    var font = cs.font || (cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily);
    var th = label.closest('.th');
    var actions = !!(th && th.classList.contains('th--actions'));
    var longest = text.split(' ').reduce(function (m, w) { return Math.max(m, measure(w, font)); }, 0);
    /* +0.5 — субпиксельная погрешность canvas против раскладки */
    var line = actions || longest > avail + 0.5;
    var dots = line && text.length > 1
      && measure(text, font) > avail + 0.5
      && measure(text.slice(0, 2) + '…', font) > avail + 0.5;
    label.classList.toggle('th__label--line', line && !actions);
    label.classList.toggle('th__label--dots', dots);
  }

  var ro = window.ResizeObserver ? new ResizeObserver(function (entries) {
    entries.forEach(function (e) {
      e.target.querySelectorAll('.th__label').forEach(fit);
    });
  }) : null;

  function refresh(root) {
    (root || document).querySelectorAll('.th__label').forEach(function (label) {
      var th = label.closest('.th');
      if (th && ro && !th.__dsLabelWatch) { th.__dsLabelWatch = true; ro.observe(th); }
      fit(label);
    });
  }

  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    Promise.resolve().then(function () {
      queued = false;
      document.querySelectorAll('.th').forEach(function (th) {
        if (!th.__dsLabelWatch && th.querySelector('.th__label')) refresh(th.parentElement || th);
      });
    });
  }

  function boot() {
    refresh(document);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { refresh(document); });
    if (window.MutationObserver) {
      new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  window.DSTableHeadLabel = { fit: fit, refresh: refresh };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
