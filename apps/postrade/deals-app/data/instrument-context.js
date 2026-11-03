/* =========================================================================
   InstrumentContext — какой договор займа (НКЛ) открыт на странице договора
   и как он назван в шапке и крошках. Общий для трёх страниц: «Договор займа»,
   «Договор и дополнительные соглашения», «Единая трансфертная ставка».

   Обычный <script> (file://, без fetch). Подключить ПОСЛЕ tranche-context.js
   (крошки красит его paintCrumbs), mock-deals.js, deals-store.js, post-api.js,
   mock-product-catalog.js, mock-deal-trees.js и product-tree-store.js; вызывать
   после ProductTreeStore.ready — иначе сохранённые правки дерева не видны.

   Экспорт: window.InstrumentContext = {
     resolve(search) → InstrumentContextView|null
     paintCrumbs(ol, patches)               — то же, что TrancheContext.paintCrumbs
   }

   Адрес: ?id=<номер сделки>&ins=<id узла договора в дереве>. Сделки или договора
   нет в адресе (или их нет в данных) — каркас: договор из той же сделки, а если
   и там нет — первый договор первой сделки, где он есть. Совсем нет договоров —
   null. Договор — инструмент с кодом LOAN_NCL («Договор займа (НКЛ)»); номер и
   название берутся из дерева продуктов сделки (ProductTreeStore), номер и
   наименование сделки — из DealsStore: те же, что на странице сделки.
   ========================================================================= */

/**
 * Открытый договор для шапки, крошек и ссылок между тремя страницами.
 * Source: invented (26.10.2026) — модель представления, не DTO.
 * @typedef {Object} InstrumentContextView
 * @property {Object} deal              запись DealsStore
 * @property {string} openedId          номер, под которым открыто дерево (его и кладём в адреса)
 * @property {Object} instrument        ProductTreeNodeView договора
 * @property {Object[]} tranches        ProductTreeNodeView траншей договора
 * @property {string} dealLabel         «1027. Приобретение сети торговых центров»
 * @property {string} instrumentLabel   «1.1.1. Договор займа (НКЛ)»
 * @property {string} dealQuery         «?id=1027»
 * @property {string} instrumentQuery   «?id=1027&ins=1027.d1.p1.i1» — адрес всех трёх страниц договора
 * @property {function(string): string} trancheQuery  id транша → «?id=1027&tr=1027.d1.p1.i1.t1»
 */
(function () {
  'use strict';

  var LOAN_CODE = 'LOAN_NCL';

  function param(search, key) {
    try { return new URLSearchParams(search || '').get(key); } catch (e) { return null; }
  }

  /* Путь [DID, PRODUCT, INSTRUMENT] или null, если узел — не договор займа. */
  function asLoanPath(path) {
    return path && path.length === 3 && path[2].code === LOAN_CODE ? path : null;
  }

  function firstLoan(nodes, trail) {
    for (var i = 0; i < nodes.length; i++) {
      var here = trail.concat(nodes[i]);
      var hit = nodes[i].kind === 'INSTRUMENT' && nodes[i].code === LOAN_CODE
        ? here
        : firstLoan(nodes[i].children, here);
      if (hit) return hit;
    }
    return null;
  }

  function label(node) { return node.number + ' ' + node.name; }

  function resolve(search) {
    var trees = window.ProductTreeStore;
    var deals = window.DealsStore;
    if (!trees || !deals) return null;

    /* открыть дерево сделки и найти в нём договор: заданный или первый */
    function pick(openedId, insId) {
      trees.use(openedId);
      return (insId && asLoanPath(trees.path(insId))) || firstLoan(trees.view(), []);
    }

    var id = param(search, 'id');
    var ins = param(search, 'ins');
    var deal = id ? deals.byId(id) : null;
    var openedId = id;
    var path = deal ? pick(id, ins) : null;

    if (!path) {
      var list = deals.list();
      /* каркас без адреса — сделка 1027: у неё два транша и заполнены все разделы договора */
      var start = 0;
      for (var s = 0; s < list.length; s++) if (String(list[s].id) === '1027') start = s;
      for (var k = 0; k < list.length && !path; k++) {
        deal = list[(start + k) % list.length];
        openedId = String(deal.id);
        path = pick(openedId, null);
      }
    }
    if (!path) return null;

    var instrument = path[2];
    var dealQuery = '?id=' + encodeURIComponent(openedId);
    return {
      deal: deal,
      openedId: String(openedId),
      instrument: instrument,
      tranches: instrument.children.filter(function (c) { return c.kind === 'TRANCHE'; }),
      dealLabel: deal.id + '. ' + (deal.name || ''),
      instrumentLabel: label(instrument),
      dealQuery: dealQuery,
      instrumentQuery: dealQuery + '&ins=' + encodeURIComponent(instrument.id),
      trancheQuery: function (trId) { return dealQuery + '&tr=' + encodeURIComponent(trId); }
    };
  }

  window.InstrumentContext = {
    resolve: resolve,
    paintCrumbs: function (ol, patches) {
      if (window.TrancheContext) window.TrancheContext.paintCrumbs(ol, patches);
    }
  };
})();
