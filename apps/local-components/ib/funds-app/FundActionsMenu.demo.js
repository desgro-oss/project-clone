/* ============================================================
   FundActionsMenu.demo.js — сценарий демо витрины для «Меню фонда».
   Пишется руками; страницу рядом собирает kit-build.mjs и подключает этот файл последним.

   Меню живёт своим рантаймом (ContextMenu ДС, урок Л139): до открытия оно скрыто, поэтому
   демо ставит над ним две кнопки-триггера — «Фонд из ЕПК» (меню fundActionsMenu) и «Фонд не
   из ЕПК» (fundActionsMenuCustom, второй файл папки, генератор вшивает его со страницы
   «Фонды»). Меню открывается по клику и закрывается штатно: пункт, Esc, клик вне.
   На странице «Фонды» триггер — кнопка «⋮» строки списка фондов (FundsTable).
   ============================================================ */
(function () {
  'use strict';

  var TRIGGERS = [
    { menu: 'fundActionsMenu', label: 'Фонд из ЕПК' },
    { menu: 'fundActionsMenuCustom', label: 'Фонд не из ЕПК' }
  ];

  window.IBPKitDemo.register('FundActionsMenu', {
    cases: function () { return []; },
    apply: function (root, st, ctx) {
      if (!ctx.live || root.__fundMenuDemo) return;
      root.__fundMenuDemo = true;
      var bar = document.createElement('div');
      bar.style.cssText = 'display:flex;gap:var(--space-8)';
      bar.innerHTML = TRIGGERS.filter(function (t) { return document.getElementById(t.menu); }).map(function (t) {
        return '<button type="button" class="btn btn--outline btn--s" data-menu="' + t.menu + '" aria-haspopup="menu" aria-expanded="false">'
          + '<span class="btn__label">' + t.label + '</span><i class="btn__chevron" data-icon="chevron-down"></i></button>';
      }).join('');
      root.parentNode.insertBefore(bar, root);
      if (window.dsIcons) window.dsIcons.apply(bar);
      if (window.DSMenu) window.DSMenu.bindAll(bar);
    }
  });
})();
