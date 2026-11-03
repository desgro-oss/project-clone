/* ============================================================
   AssetActionsMenu.demo.js — сценарий демо витрины для «Меню актива».
   Пишется руками; страницу рядом собирает kit-build.mjs и подключает этот файл последним.

   Меню живёт своим рантаймом (Л139): перед ним ставится кнопка «⋮» — такая же, как в
   строке AssetsTable, — и меню открывается по ней штатно (ContextMenu ДС), закрывается
   кликом мимо, Esc и выбором пункта. На стенде — вариант актива с partyId
   (AssetActionsMenu.html); вариант без partyId — AssetActionsMenuCustom.html, на два пункта.
   ============================================================ */
(function () {
  'use strict';

  window.IBPKitDemo.register('AssetActionsMenu', {
    apply: function (menu, st, ctx) {
      if (!ctx.live || menu.__lcDemoBound || !window.DSMenu) return;
      menu.__lcDemoBound = true;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ibtn ibtn--neutral ibtn--m';
      btn.setAttribute('aria-label', 'Действия с активом «Роза Хутор»');
      btn.setAttribute('aria-haspopup', 'menu');
      btn.setAttribute('data-menu-align', 'end');
      btn.innerHTML = '<i data-icon="more-dots"></i>';
      menu.parentNode.insertBefore(btn, menu);
      if (window.dsIcons) window.dsIcons.apply(btn);
      window.DSMenu.bind(btn, { menu: menu, align: 'end' });
    }
  });
})();
