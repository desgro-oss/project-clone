/* ============================================================
   AssetsTable.js — поведение виджета AssetsTable «Активы фонда».

   API (контракт страницы FundsPipeline, задача MS0020 Э1, Э2):
     window.AssetsTable.render(root, { fund, assets })
       fund   — FundItemDto выбранного фонда (data/funds.js);
       assets — AssetItemDto[] активов этого фонда; пустой массив — пустое
                состояние (data-state="empty"), иначе data-state="data".
       Перерисовывает заголовок «Активы <name>», таблицу и пустое состояние
       и заново связывает рантаймы ДС (Л93). Вид колонок из окна «Настройка
       таблицы» возвращается на новую таблицу (DSTableSettings.restore).
   События (CustomEvent, bubbles: true, на корне виджета):
     assetstable:close — крестик в шапке; detail {}.
   Шестерёнка «Настроить колонки» — хук ДС data-table-settings: стандартное окно
   TableSettings строит рантайм ДС из колонок шапки (рисуются все колонки,
   у каждой .th — data-col), таблицу находит по .dtable. Настройка живёт на
   время сессии: data-table-persist="AssetsTable" на .tbl (стоит в разметке),
   переживает выбор другого фонда. «Добавить актив» и пункты меню
   строк окон не открывают (окна активов не делаются, решение человека
   30.10.2026).
   ============================================================ */
(function () {
  'use strict';

  /* Колонки — AssetsTable.config.ts фронтенда (имена, ширины, выравнивание,
     сортировка). Колонка «icon» фронтенда здесь — аватар внутри ячейки
     «name», как на макете «Fund assets» (одна колонка «Название актива»):
     ширина name = 64 + 208. */
  var COLUMNS = [
    { name: 'name', title: 'Название актива', width: '272px', sort: 'text' },
    { name: 'alias', title: 'Псевдоним', width: '158px', sort: 'text', hidden: true },
    { name: 'acquisitionYear', title: 'Дата приобретения', width: '120px', sort: 'date' },
    { name: 'ev', title: 'Enterprise Value, млн RUB', width: '180px', sort: 'number', numbers: true, scale: 1000 },
    { name: 'mcap', title: 'MCAP / 100% equity, млн RUB', width: '145px', sort: 'number', numbers: true, scale: 1000 },
    { name: 'ownershipPercent', title: 'Доля владения', width: '125px', sort: 'number', numbers: true },
    { name: 'ownershipValue', title: 'Стоимость доли, млн RUB', width: '180px', sort: 'number', numbers: true, scale: 1000 },
    { name: 'gicsIndustry', title: 'Отрасль', width: 'minmax(200px,1fr)' },
    { name: 'actions', title: 'Действия', width: '52px', pinned: true }
  ];
  /* Вид по умолчанию — как во фронтенде: «Псевдоним» скрыт (hidden →
     data-col-hidden, Table ДС 1.025; ячейки в строках есть, колонку убирает
     рантайм ДС), «Действия» закреплена. scale — делитель отображения:
     EV, MCAP и стоимость доли в данных на три разряда больше подписи
     «млн RUB» (решения человека 30.10.2026 — «отрезать 000», «суммы одного
     порядка»), данные не трогаем. */
  var PERSIST_KEY = 'AssetsTable';
  var DASH = '—';
  var NBSP = ' ';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function isEmpty(v) { return v == null || v === ''; }

  /* Разряды — неразрывным пробелом, дробная часть — запятая (ru-RU). */
  function num(v) {
    if (isEmpty(v) || isNaN(Number(v))) return null;
    var parts = String(Math.abs(Number(v))).split('.');
    var int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
    return (Number(v) < 0 ? '−' : '') + int + (parts[1] ? ',' + parts[1] : '');
  }
  /* ISO (2021-01-01 или с временем) → ДД.ММ.ГГГГ */
  function date(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    return m ? m[3] + '.' + m[2] + '.' + m[1] : null;
  }

  /* Инициалы аватара — алгоритм getAvatarLetters фронтенда
     (FundOrAssetNameCell.utils.ts): содержимое кавычек, без орг.-правовой
     формы и спецсимволов; два слова — первые буквы, одно — две первые буквы.
     Без пробела между буквами: так их пишет Avatar ДС («ИБ»). */
  var LEGAL = /(^|\s)(ООО|АО|ЗАО|ПАО|НАК|НКО|ИП|ПФ|ФГУП|ГУП|МУП|КФ|КХ|СХП|СО|ТОО|ККА|АГР)(?=\s|$)/gi;
  function initials(name) {
    if (!name) return '';
    var s = String(name);
    var q = /["«“„'](.*)["»”'"]/.exec(s);
    if (q) s = q[1];
    s = s.replace(/["«»“”„']+/g, '').replace(LEGAL, ' ').replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s]/g, ' ').trim();
    var w = s.split(/\s+/).filter(Boolean);
    if (!w.length) return '';
    if (w.length === 1) return (w[0].charAt(0) + (w[0].charAt(1) || w[0].charAt(0))).toUpperCase();
    return (w[0].charAt(0) + w[1].charAt(0)).toUpperCase();
  }

  function state(root) {
    if (!root.__lcAssets) root.__lcAssets = { fund: null, assets: [] };
    return root.__lcAssets;
  }
  /* значение в единицах подписи колонки: / scale, без хвоста двоичной арифметики */
  function scaled(v, scale) {
    if (!scale || isEmpty(v) || isNaN(Number(v))) return v;
    return Number((Number(v) / scale).toFixed(3));
  }
  function grid(cols) {
    return ['8px'].concat(cols.map(function (c) { return c.width; })).concat(['minmax(8px,1fr)']).join(' ');
  }

  /* ── шапка таблицы ───────────────────────────────────────────────── */
  var RESIZE = '<span class="th__resize" role="separator" aria-orientation="vertical" tabindex="0" aria-label="Изменить ширину колонки"></span>';
  function headCell(c) {
    if (c.pinned) {
      /* «Действия» — обычная колонка, закреплённая по умолчанию: в окне «Настройка
         таблицы» её можно открепить, перенести или скрыть (решение человека 30.10.2026) */
      return '<div class="th th--actions th--pinned" data-col="' + c.name + '"><span class="th__label">' + esc(c.title) + '</span>' + RESIZE + '</div>';
    }
    var cls = 'th' + (c.numbers ? ' th--right' : '');
    var sort = c.sort
      ? '<span class="th__tools"><button type="button" class="ibtn ibtn--neutral ibtn--s th__sort" data-sort="' + c.name + '" aria-label="Сортировать"><i data-icon="arrow-up-down"></i></button></span>'
      : '';
    return '<div class="' + cls + '" data-col="' + c.name + '"' + (c.hidden ? ' data-col-hidden' : '') + (c.sort ? ' data-sort-type="' + c.sort + '" aria-sort="none"' : '') + '>'
      + '<span class="th__label">' + esc(c.title) + '</span>' + sort + RESIZE + '</div>';
  }

  /* ── ячейки ──────────────────────────────────────────────────────── */
  function textCell(col, text, sortValue) {
    var empty = isEmpty(text);
    return '<div class="tc" data-col="' + col + '"' + (empty ? '' : ' data-sort-value="' + esc(sortValue != null ? sortValue : text) + '"') + '><span class="tc__row">'
      + (empty ? '<span class="tc__text tc__empty">' + DASH + '</span>' : '<span class="tc__text tc__text--truncate">' + esc(text) + '</span>')
      + '</span></div>';
  }
  function numCell(col, value, postfix) {
    var t = num(value);
    if (t == null) return '<div class="tc tc--numbers" data-col="' + col + '"><span class="tc__row"><span class="tc__text tc__empty">' + DASH + '</span></span></div>';
    return '<div class="tc tc--numbers" data-col="' + col + '" data-sort-value="' + esc(value) + '"><span class="tc__row"><span class="tc__text">' + t + '</span>'
      + (postfix ? '<span class="tc__postfix">' + postfix + '</span>' : '') + '</span></div>';
  }
  function nameCell(a) {
    var inn = a.inn ? 'ИНН' + NBSP + a.inn : null;
    var kpp = a.kpp ? 'КПП' + NBSP + a.kpp : null;
    var sub = inn && kpp ? inn + ' · ' + kpp : (inn || kpp);
    var title = a.name || 'Без названия';
    return '<div class="tc" data-col="name" data-sort-value="' + esc(title) + '"><span class="tc__row">'
      + '<span class="av av--rounded av--m" data-av-seed="' + esc(a.objectId || a.name || '') + '" aria-hidden="true"><span class="av__text">' + esc(initials(a.name)) + '</span></span>'
      + '<span class="tc__body"><span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(title) + '</span></span>'
      + (sub ? '<span class="tc__subtext">' + esc(sub) + '</span>' : '')
      + '</span></span></div>';
  }
  function industryCell(a) {
    var g = a.gicsIndustry;
    if (!g || isEmpty(g.name)) return textCell('gicsIndustry', null);
    return '<div class="tc" data-col="gicsIndustry" data-sort-value="' + esc(g.name) + '"><span class="tc__row">'
      + '<span class="chip chip--s"><span class="chip__label">' + esc(g.name) + '</span></span></span></div>';
  }
  function actionsCell(a) {
    /* «Перейти на страницу клиента» — только у актива с partyId (useAssetActions):
       второе меню без этого пункта (допущение 30.10.2026) */
    var menu = a.partyId ? 'assetActionsMenu' : 'assetActionsMenuCustom';
    return '<div class="tc tc--center tc--pinned" data-col="actions"><button type="button" class="ibtn ibtn--neutral ibtn--m"'
      + ' aria-label="Действия с активом «' + esc(a.name || 'Без названия') + '»" aria-haspopup="menu" data-menu="' + menu + '" data-menu-align="end"'
      + ' data-asset-id="' + esc(a.objectId) + '"><i data-icon="more-dots"></i></button></div>';
  }
  function cell(c, a) {
    switch (c.name) {
      case 'name': return nameCell(a);
      case 'alias': return textCell('alias', a.alias);
      case 'acquisitionYear': return textCell('acquisitionYear', date(a.acquisitionYear), a.acquisitionYear);
      case 'ev': return numCell('ev', scaled(a.ev, c.scale));
      case 'mcap': return numCell('mcap', scaled(a.mcap, c.scale));
      case 'ownershipPercent': return numCell('ownershipPercent', a.ownershipPercent, '%');
      case 'ownershipValue': return numCell('ownershipValue', scaled(a.ownershipValue, c.scale));
      case 'gicsIndustry': return industryCell(a);
      case 'actions': return actionsCell(a);
    }
    return '';
  }

  function tableHTML(st) {
    var cols = COLUMNS, g = grid(cols);
    var sep = function (k) { return '<div class="' + k + ' ' + k + '--separator"></div>'; };
    var html = '<div class="tbl__row tbl__row--head" style="grid-template-columns:' + g + '">'
      + sep('th') + cols.map(headCell).join('') + sep('th') + '</div>';
    st.assets.forEach(function (a) {
      html += '<div class="tbl__row" data-asset-id="' + esc(a.objectId) + '" style="grid-template-columns:' + g + '">'
        + sep('tc') + cols.map(function (c) { return cell(c, a); }).join('') + sep('tc') + '</div>';
    });
    return html;
  }

  /* после пересборки поддерева — все рантаймы, чья разметка попала внутрь (Л93) */
  function rebind(root, tbl) {
    var w = window;
    if (w.dsIcons) w.dsIcons.apply(root);
    if (w.DSTable) { w.DSTable.bindAll(root); w.DSTable.wire(tbl); }
    if (w.DSTablePin) w.DSTablePin.bind(tbl);
    if (w.DSMenu) w.DSMenu.bindAll(root);
    if (w.DSTooltip) w.DSTooltip.bindAll(root);
    var btn = root.querySelector('[data-table-settings]');
    if (btn && w.DSTableSettings) w.DSTableSettings.bind(btn);
  }

  function drawTable(root) {
    var st = state(root);
    var old = root.querySelector('[data-at-tbl]');
    if (!old) return;
    if (window.DSTooltip && window.DSTooltip.hideAll) window.DSTooltip.hideAll();
    /* новый узел .tbl: рантайм таблицы связывает узел один раз (wire) */
    var tbl = old.cloneNode(false);
    tbl.setAttribute('data-table-persist', PERSIST_KEY);
    /* снимок колонок окна настройки — от старой шапки; новая таблица строит свой */
    tbl.__dsTableSettings = null;
    tbl.innerHTML = tableHTML(st);
    old.parentNode.replaceChild(tbl, old);
    rebind(root, tbl);
    /* вид колонок и сортировка на время сессии — на новую таблицу; в пустом
       состоянии таблица скрыта, рантайм применит, когда она появится */
    if (window.DSTableSettings) window.DSTableSettings.restore(tbl);
  }

  function render(root, opts) {
    if (!root) return;
    opts = opts || {};
    var st = state(root);
    st.fund = opts.fund || null;
    st.assets = Array.isArray(opts.assets) ? opts.assets : [];
    var fund = st.fund || {};
    var name = fund.name || 'Без названия';
    var empty = !st.assets.length;

    var title = root.querySelector('[data-at-title]');
    if (title) title.textContent = 'Активы ' + name;
    /* пустое состояние: «<name> · ИНН <inn>», без ИНН — «—» (EmptyAssetsPreview) */
    var text = root.querySelector('[data-at-empty-text]');
    if (text) text.textContent = name + ' · ' + (fund.inn ? 'ИНН' + NBSP + fund.inn : DASH);
    /* шестерёнка настройки в пустом состоянии не рисуется (макет «Fund assets empty») */
    var setup = root.querySelector('[data-table-settings]');
    if (setup) setup.hidden = empty;
    /* в режиме просмотра «Добавить актив» не рисуется (правила LocalComponents) */
    var view = root.getAttribute('data-mode') === 'view';
    root.querySelectorAll('.lc-assets-table__add').forEach(function (b) { b.hidden = view; });

    root.setAttribute('data-state', empty ? 'empty' : 'data');
    drawTable(root);
  }

  /* крестик шапки — делегированием на документе: корень может появиться
     позже (ds-include) и перерисовываться */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-at-close]');
    if (!btn) return;
    var root = btn.closest('.lc-assets-table');
    if (root) root.dispatchEvent(new CustomEvent('assetstable:close', { bubbles: true, detail: {} }));
  });

  window.AssetsTable = { render: render, columns: COLUMNS };
})();
