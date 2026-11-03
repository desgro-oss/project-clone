/* ============================================================
   FinancialMetricsDownloadReportModal.js — поведение окна «Выгрузка отчета» страницы
   «Финансовые метрики».

   Делает то, чего нет в рантаймах ДС, и только это:
   1) вид окна: с шифрованием (сеть Сигма) — виден блок получателей, окно
      шире (w8); без шифрования (Альфа / Омега) — блока нет (w6);
   2) с шифрованием: список получателей — добавление сотрудника из
      справочника и сотрудника вне штата по e-mail, чекбоксы строк и
      «выбрать всех»; «Выгрузить» выключена, пока не отмечен ни один;
   3) по «Выгрузить» закрывает окно и отдаёт странице контекст выгрузки и
      список получателей. Саму выгрузку, её успех и ошибку показывает
      страница.

   API:
     PostDealDownloadReportModal.bind(scrim, opts) → api
       opts.employees   — справочник ReportEmployeeRsDto[]
       opts.run(ctx, recipients) — выгрузка: ctx — то, что передали в api.open
     api.open(ctx)      — ctx.encrypted решает, какой вид окна открыть
     api.load(ctx, recipients) — вид и получатели без показа окна (живое демо витрины)
     PostDealDownloadReportModal.preview(scrim, { encrypted, recipients }) — снимок вида для витрины
   ============================================================ */
(function () {
  'use strict';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  /* Недоступное действие выключается атрибутом, а не только прячется (урок Л235). */
  function setEnabled(el, on) {
    el.disabled = !on;
    if (on) el.removeAttribute('aria-disabled'); else el.setAttribute('aria-disabled', 'true');
  }

  function rowHtml(r, idx, grid) {
    return '<div class="tbl__row" data-row="' + idx + '" data-key="' + esc(r.key) + '" style="grid-template-columns:' + grid + ';">'
      + '<div class="tc tc--separator"></div>'
      + '<div class="tc tc--select"><label class="cb cb--no-content"><input type="checkbox" class="cb__input" aria-label="Выбрать получателя"' + (r.checked ? ' checked' : '') + '><span class="cb__box"><span class="cb__mark"><i data-icon="check"></i></span></span></label></div>'
      + '<div class="tc"><span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(r.fullName || '—') + '</span></span></div>'
      + '<div class="tc"><span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(r.positionName || '—') + '</span></span></div>'
      + '<div class="tc"><span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(r.externalEmail || '—') + '</span></span></div>'
      + '<div class="tc"><span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(r.internalEmail || '—') + '</span></span></div>'
      + '<div class="tc tc--separator"></div></div>';
  }

  /* Вид окна: блок получателей и ширина. Тот же код ведёт живое окно и снимки витрины. */
  function paintVariant(scrim, enc) {
    var modal = scrim.querySelector('.modal');
    scrim.querySelector('[data-dl-recipients]').hidden = !enc;
    modal.classList.toggle('modal--w8', enc);
    modal.classList.toggle('modal--w6', !enc);
    modal.setAttribute('data-dl-variant', enc ? 'encrypted' : 'plain');
    /* поля блока получателей лежат под hidden, но Modal их видит и защищает слой от клика по скриму;
       без шифрования полей на экране нет — клик по скриму закрывает окно */
    if (enc) scrim.removeAttribute('data-modal-guarded'); else scrim.setAttribute('data-modal-guarded', 'false');
  }

  /* Строки таблицы получателей. Шапку ищем в момент отрисовки: рантаймы таблицы ДС вправе её
     перестроить (Л185). */
  function drawRows(table, rows) {
    var head = table.querySelector('.tbl__row--head');
    var grid = head ? head.style.gridTemplateColumns : '';
    Array.prototype.forEach.call(table.querySelectorAll('.tbl__row:not(.tbl__row--head)'), function (n) { n.remove(); });
    table.insertAdjacentHTML('beforeend', rows.map(function (r, i) { return rowHtml(r, i, grid); }).join(''));
    if (window.dsIcons) window.dsIcons.apply(table);
  }

  /* «Выбрать всех» и «Выгрузить» по отмеченным; без шифрования получателей нет — «Выгрузить»
     доступна сразу. */
  function syncChecks(scrim, rows, enc) {
    var on = rows.filter(function (r) { return r.checked; }).length;
    var all = scrim.querySelector('[data-dl-all]');
    all.checked = rows.length > 0 && on === rows.length;
    all.indeterminate = on > 0 && on < rows.length;
    setEnabled(scrim.querySelector('[data-dl-submit]'), !enc || on > 0);
  }

  function bind(scrim, opts) {
    if (!scrim) return null;
    if (scrim.__dlReport) return scrim.__dlReport;
    opts = opts || {};
    var employees = opts.employees || [];

    var modal = scrim.querySelector('.modal');
    var employeeInput = scrim.querySelector('[data-dl-employee]');
    var employeeList = scrim.querySelector('#fm-dl-employee-list');
    var addEmployee = scrim.querySelector('[data-dl-add-employee]');
    var emailInput = scrim.querySelector('[data-dl-email]');
    var addEmail = scrim.querySelector('[data-dl-add-email]');
    var table = scrim.querySelector('[data-dl-rows]');
    var allBox = scrim.querySelector('[data-dl-all]');
    var submit = scrim.querySelector('[data-dl-submit]');
    if (!modal || !employeeInput || !table || !submit) return null;

    var rows = [];        // { key, fullName, positionName, externalEmail, internalEmail, checked }
    var picked = null;    // сотрудник, выбранный в автокомплите
    var ctx = null;

    function option(e) {
      return '<button class="ddl__item" role="option" aria-selected="false" data-employee="' + esc(e.employeeId) + '">'
        + '<span class="ddl__item-body"><span class="ddl__item-label">' + esc(e.fullName) + '</span></span></button>';
    }
    function fillOptions(query) {
      var q = (query || '').trim().toLowerCase();
      var list = employees.filter(function (e) { return !q || e.fullName.toLowerCase().indexOf(q) >= 0; });
      employeeList.innerHTML = list.length
        ? list.map(option).join('')
        : '<div class="ddl__state ddl__state--empty">Ничего не найдено</div>';
    }

    function encrypted() { return !!(ctx && ctx.encrypted); }
    function sync() { syncChecks(scrim, rows, encrypted()); }
    function draw() {
      drawRows(table, rows);
      sync();
    }
    function rowNode(key) {
      return Array.prototype.filter.call(table.querySelectorAll('.tbl__row[data-key]'), function (n) { return n.getAttribute('data-key') === key; })[0] || null;
    }
    /* показать строку получателя: прокрутка и кратковременная подсветка */
    function reveal(key) {
      var n = rowNode(key);
      if (!n) return;
      if (n.scrollIntoView) n.scrollIntoView({ block: 'nearest' });
      n.classList.add('tbl__row--focus');
      setTimeout(function () { n.classList.remove('tbl__row--focus'); }, 1600);
    }

    /* уже добавленный получатель не дублируется: строка отмечается и подсвечивается */
    function addRow(r) {
      var have = rows.filter(function (x) { return x.key === r.key; })[0];
      if (have) have.checked = true; else { r.checked = true; rows.push(r); }
      draw();
      reveal(r.key);
    }

    /* сотрудник — по выбору из списка либо по точному совпадению ФИО в поле */
    function currentEmployee() {
      var v = employeeInput.value.trim().toLowerCase();
      if (picked && picked.fullName.toLowerCase() === v) return picked;
      return employees.filter(function (e) { return e.fullName.toLowerCase() === v; })[0] || null;
    }
    function syncAdders() {
      setEnabled(addEmployee, !!currentEmployee());
      setEnabled(addEmail, EMAIL_RE.test(emailInput.value.trim()));
    }
    function doAddEmployee() {
      var e = currentEmployee();
      if (!e) return;
      addRow({ key: e.employeeId, fullName: e.fullName, positionName: e.positionName, externalEmail: e.externalEmail, internalEmail: e.internalEmail });
      employeeInput.value = ''; picked = null; fillOptions(''); syncAdders();
    }
    function doAddEmail() {
      var mail = emailInput.value.trim();
      if (!EMAIL_RE.test(mail)) return;
      /* домен определяет только сам адрес (часть после @): колонку второго домена не заполняем */
      var internal = /omega|alfa/i.test(mail.split('@').pop());
      addRow({ key: 'mail:' + mail.toLowerCase(), fullName: '', positionName: '', externalEmail: internal ? '' : mail, internalEmail: internal ? mail : '' });
      emailInput.value = ''; syncAdders();
    }

    window.DSDropdownList.bind(scrim.querySelector('[data-ddl="fm-dl-employee-list"]'), {
      onSelect: function (item) {
        var id = item.getAttribute('data-employee');
        picked = employees.filter(function (e) { return e.employeeId === id; })[0] || null;
        employeeInput.value = picked ? picked.fullName : '';
        syncAdders();
      }
    });
    employeeInput.addEventListener('input', function () {
      fillOptions(employeeInput.value);
      syncAdders();
    });
    employeeInput.addEventListener('change', syncAdders);
    scrim.addEventListener('ds-input:clear', function (e) {
      if (e.target.closest && e.target.closest('.inp') && e.target.closest('.inp').contains(employeeInput)) {
        employeeInput.value = ''; picked = null; fillOptions('');
      }
      syncAdders();
    });
    emailInput.addEventListener('input', syncAdders);
    emailInput.addEventListener('change', syncAdders);
    /* Enter в поле — то же, что «Добавить» (если список автокомплита не выбирает опцию) */
    emailInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); doAddEmail(); } });
    employeeInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && currentEmployee()) { e.preventDefault(); doAddEmployee(); }
    });

    addEmployee.addEventListener('click', function () { if (!addEmployee.disabled) doAddEmployee(); });
    addEmail.addEventListener('click', function () { if (!addEmail.disabled) doAddEmail(); });

    table.addEventListener('change', function (e) {
      var box = e.target.closest('.tc--select .cb__input');
      if (!box) return;
      var row = box.closest('.tbl__row');
      var r = rows[+row.getAttribute('data-row')];
      if (!r) return;
      r.checked = box.checked;
      sync();
    });
    allBox.addEventListener('change', function () {
      rows.forEach(function (r) { r.checked = allBox.checked; });
      draw();
    });

    submit.addEventListener('click', function () {
      if (submit.disabled) return;
      var chosen = encrypted() ? rows.filter(function (r) { return r.checked; }) : [];
      if (window.DSModal) window.DSModal.closeTop(true);
      if (opts.run) opts.run(ctx, chosen);
    });

    /* Подготовить окно к показу: вид, пустые поля, таблица. list — готовые получатели (витрина). */
    function prepare(c, list) {
      ctx = c || {};
      rows = (list || []).map(function (e) {
        return { key: e.employeeId, fullName: e.fullName, positionName: e.positionName, externalEmail: e.externalEmail, internalEmail: e.internalEmail, checked: true };
      });
      paintVariant(scrim, encrypted());
      employeeInput.value = ''; emailInput.value = ''; picked = null;
      fillOptions('');
      syncAdders();
      draw();
    }
    function open(c) {
      /* получатели прошлого открытия остаются, пока открыта страница */
      ctx = c || {};
      paintVariant(scrim, encrypted());
      employeeInput.value = ''; emailInput.value = ''; picked = null;
      fillOptions('');
      syncAdders();
      draw();
      window.DSModal.open(scrim);
    }

    /* load — для живого демо витрины: вид и получатели без показа окна */
    var api = { open: open, load: prepare };
    scrim.__dlReport = api;
    return api;
  }

  /* Снимок вида без привязки обработчиков — для витрины: preview(scrim, { encrypted, recipients }),
     recipients — строки таблицы (ReportEmployeeRsDto), все отмечены. */
  function preview(scrim, cfg) {
    if (!scrim) return;
    cfg = cfg || {};
    var enc = !!cfg.encrypted;
    var list = (cfg.recipients || []).map(function (e) {
      return { key: e.employeeId, fullName: e.fullName, positionName: e.positionName, externalEmail: e.externalEmail, internalEmail: e.internalEmail, checked: true };
    });
    paintVariant(scrim, enc);
    drawRows(scrim.querySelector('[data-dl-rows]'), list);
    syncChecks(scrim, list, enc);
  }

  window.PostDealDownloadReportModal = { bind: bind, preview: preview };
})();
