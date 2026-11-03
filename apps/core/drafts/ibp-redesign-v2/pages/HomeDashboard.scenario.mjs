import { readFileSync } from 'node:fs';

// Прогон DOM без браузера. DSCopy подменяется для проверки вызовов;
// содержимое системного буфера обмена этим сценарием не проверяется.
export default async function (page) {
  const { window, document } = page;
  const profile = document.querySelector('.hd-profile');
  if (!page.check(!!profile, 'Профиль дашборда собран')) return;
  const contacts = [['phone', '+7 495 000-10-42'], ['email', 'a.kim@example.ru'], ['employeeNumber', '21492411']];
  const copied = [];
  const notices = [];
  const originalCopy = window.DSCopy.write;
  const originalToast = window.DSToast.show;
  const originalCommand = document.execCommand;
  const commandWasOwn = Object.prototype.hasOwnProperty.call(document, 'execCommand');
  window.DSCopy.write = value => { copied.push(value); return Promise.resolve(); };
  window.DSToast.show = options => { notices.push(options); return originalToast(options); };
  const resetCommand = () => {
    if (commandWasOwn) document.execCommand = originalCommand;
    else delete document.execCommand;
  };
  // Прямое DOM-событие использует реальные слушатели страницы, обходя
  // releasePage панели: её текущий ui.js ошибочно помечает Tooltip-цель data-pp-own.
  const click = async (selector, options = {}) => {
    const element = document.querySelectorAll(selector)[options.index || 0];
    if (!page.check(!!element, 'Есть цель клика ' + selector)) return;
    element.click();
    await page.wait(0);
  };
  try {
    page.step('Три значения копируются по тексту, иконки неактивны');
    for (const [key, value] of contacts) {
      const selector = '[data-hd-copy="' + key + '"]';
      const button = profile.querySelector(selector);
      page.check(button?.tagName === 'BUTTON' && button.textContent === value, key + ': текстовая кнопка содержит значение');
      page.check(button?.getAttribute('data-tooltip') === 'Скопировать', key + ': точный Tooltip');
      button.focus();
      page.check(document.activeElement === button, key + ': кнопка получает фокус');
      const contact = button.closest('.hd-profile__contact');
      const contactIcon = contact.querySelector('.hd-profile__contact-icon');
      page.check(contactIcon?.getAttribute('aria-hidden') === 'true' && !contactIcon.closest('button, a, [role="button"]'), key + ': иконка декоративная');
      const before = copied.length;
      await click('.hd-profile__contact-icon', { index: contacts.findIndex(item => item[0] === key) });
      await page.wait(0);
      page.check(copied.length === before && document.getElementById('hd-profile-details').hidden, key + ': клик по иконке не копирует и не открывает профиль');
      await click(selector);
      page.check(copied.at(-1) === value && copied.length === before + 1, key + ': DSCopy.write получает именно значение');
      page.check(notices.at(-1)?.message === 'Скопировано' && !notices.at(-1)?.tone, key + ': нейтральный Toast «Скопировано»');
      page.check(!!document.querySelector('.toast-layer--bar .toast__msg'), 'Toast находится в верхнем слое bar');
      page.check(document.execCommand === originalCommand, 'execCommand восстановлен после успеха');
    }
    page.check(!profile.querySelector('a[href^="mailto:"]'), 'Почта не открывает mailto');
    page.check(!profile.querySelector('.hd-profile__contacts [data-modal]'), 'В контактах нет открытия профиля');

    page.step('Отказ копирования не подтверждается как успех');
    window.DSCopy.write = () => Promise.reject(new Error('Отказ Clipboard API'));
    await click('[data-hd-copy="phone"]');
    page.check(notices.at(-1)?.message === 'Не удалось скопировать' && notices.at(-1)?.tone === 'error', 'Отказ Promise даёт только ошибку');
    page.check(document.execCommand === originalCommand, 'execCommand восстановлен после reject');
    for (const mode of ['false', 'throw']) {
      const failedCommand = function (command) {
        page.check(this === document && command === 'copy', 'fallback сохраняет this и аргументы');
        if (mode === 'throw') throw new Error('Копирование запрещено');
        return false;
      };
      document.execCommand = failedCommand;
      // Воспроизводим контракт DSCopy: fallback проглатывает false/исключение.
      window.DSCopy.write = () => {
        try { document.execCommand('copy'); } catch (_) {}
        return Promise.resolve();
      };
      const start = notices.length;
      await click('[data-hd-copy="email"]');
      page.check(notices.length === start + 1 && notices.at(-1)?.message === 'Не удалось скопировать', 'fallback ' + mode + ': только ошибка, без успеха');
      page.check(document.execCommand === failedCommand, 'fallback ' + mode + ': метод восстановлен');
    }
    resetCommand();
    page.step('Быстрые нажатия выполняются последовательно');
    const releases = [];
    const queued = [];
    window.DSCopy.write = value => { queued.push(value); return new Promise(resolve => releases.push(resolve)); };
    for (const [key] of contacts) profile.querySelector('[data-hd-copy="' + key + '"]').dispatchEvent(new window.Event('click', { bubbles: true }));
    await page.wait(0);
    page.check(queued.length === 1, 'До завершения первой попытки вторая не началась');
    for (let i = 0; i < contacts.length; i++) {
      releases[i]();
      await page.wait(0);
    }
    page.check(JSON.stringify(queued) === JSON.stringify(contacts.map(item => item[1])), 'Очередь передаёт все три значения в порядке нажатий');
    page.check(document.execCommand === originalCommand, 'После очереди исходный execCommand восстановлен');

    page.step('Профиль открывается по ФИО и штатно закрывается');
    const name = profile.querySelector('h2 .hd-profile__name-button');
    page.check(name?.getAttribute('data-tooltip') === 'Открыть профиль пользователя' && name?.dataset.modal === 'hd-profile-details', 'ФИО — доступная кнопка с точным Tooltip и Modal-хуком');
    name.focus();
    page.check(document.activeElement === name, 'ФИО получает фокус клавиатуры');
    await click('.hd-profile__name-button');
    page.check(!document.getElementById('hd-profile-details').hidden, 'Нажатие на ФИО открывает диалог');
    await click('#hd-profile-details [data-modal-close]');
    page.check(document.getElementById('hd-profile-details').hidden, 'Штатный крестик закрывает диалог');
    page.check(!profile.querySelector('[data-hd-demo-date]') && !profile.textContent.includes('Демо · 9 октября 2026'), 'Строка демо-даты отсутствует');
    page.check(!!profile.querySelector('.hd-profile__avatar-edit [data-icon="edit"]'), 'Карандаш аватара присутствует как декоративная иконка');

    page.step('AI-карточка ведёт в раздел, список не содержит отдельных действий');
    const ai = document.querySelector('.hd-kpi--ai');
    page.check(ai?.tagName === 'A' && ai.getAttribute('href').includes('LeadsNew.preview.html?tab=picks'), 'Вся карточка AI ведёт в раздел рекомендаций');
    page.check(!ai.querySelector('a, button, [tabindex], [data-modal]') && !ai.textContent.includes('Все рекомендации'), 'Внутри AI нет отдельных ссылок и кнопки «Все рекомендации»');
    const ideas = window.LEADS.all();
    for (const row of ai.querySelectorAll('.hd-ai-item')) {
      const idea = row.querySelector('.hd-ai-item__idea').textContent;
      const client = row.querySelector('.hd-ai-item__client').textContent;
      page.check(ideas.some(item => (item.idea || item.id) === idea && item.clientName === client), 'Напротив рекомендации показан её клиент');
    }
    page.check(document.querySelectorAll('.hd-kpi__middle--summary').length === 2, 'AI и активные задачи используют общую раскладку счётчика и пояснения');

    page.step('Новости ведут на страницу «Новости» на вкладку области карточки');
    const newsKpi = Array.from(document.querySelectorAll('a.hd-kpi')).find(a => a.textContent.includes('Новости моих клиентов'));
    page.check(newsKpi?.getAttribute('href') === 'NewsPage.preview.html?scope=my', 'Карточка-счётчик ведёт на «Мои клиенты»');
    for (const [value, scope] of [['MY', 'my'], ['DESK', 'desk'], ['FAV', 'fav']]) {
      await click('[data-hd-segment="news"] [data-hd-value="' + value + '"]');
      page.check(document.querySelector('[data-hd-news-header]')?.getAttribute('href') === 'NewsPage.preview.html?scope=' + scope, scope + ': стрелка в шапке ведёт на вкладку');
      page.check(document.querySelector('[data-hd-news-link]')?.getAttribute('href') === 'NewsPage.preview.html?scope=' + scope, scope + ': «Все новости...» ведёт на вкладку');
      const items = Array.from(document.querySelectorAll('.hd-news-item'));
      page.check(items.length > 0 && items.every(a => a.tagName === 'A' && /^NewsPage\.preview\.html\?scope=/.test(a.getAttribute('href')) && a.getAttribute('href').includes('scope=' + scope + '&id=N-')), scope + ': каждая новость ведёт на себя');
    }
    page.check(!document.querySelector('[data-hd-news-more]'), 'Раскрытия списка на месте больше нет');

    page.step('События: общие виджеты, 10 последних и подробности на главной');
    const events = document.getElementById('hd-events');
    const E = window.IBPR_EVENTS;
    const eventRows = () => Array.from(events.querySelectorAll('[data-event-id]'));
    const selectedEvent = () => events.querySelector('[data-event-id][aria-current="true"]')?.getAttribute('data-event-id');
    const eventChip = code => events.querySelector('[data-hd-event-type="' + code + '"]');
    const eventLink = () => new URL(events.querySelector('[data-hd-events-link]').getAttribute('href'), window.location.href);
    const checkDetails = () => {
      const item = E.all().find(e => e.eventId === selectedEvent());
      page.check(events.querySelector('[data-event-title]')?.textContent === item?.title, 'Подробности соответствуют выделенному событию');
      const links = Array.from(events.querySelectorAll('[data-event-links] a'));
      page.check(!!item && links.length === item.entities.length && links.every((a, i) => a.getAttribute('href') === E.entityHref(item.entities[i])), 'Связанные объекты открываются как на EventsPage');
      page.check(Array.from(events.querySelectorAll('[data-hd-events-link]')).every(a => a.getAttribute('href') === events.querySelector('[data-hd-events-link]').getAttribute('href')) && eventLink().searchParams.get('id') === selectedEvent(), '«Все события...» и стрелка сохраняют выделение');
    };
    page.check(!!events && eventRows().length === Math.min(10, E.all().filter(e => e.isMine).length), 'В карточке 10 событий «Моих»');
    page.check(eventRows().map(r => r.getAttribute('data-event-id')).join() === E.all().filter(e => e.isMine).slice(0, 10).map(e => e.eventId).join(), 'Порядок от новых к старым, ограничение после отбора');
    page.check(selectedEvent() === eventRows()[0]?.getAttribute('data-event-id'), 'Первое событие выбрано автоматически');
    page.check(events.querySelector('[data-hd-segment="events"]')?.classList.contains('segctrl--fullwidth'), 'Область событий на всю ширину');
    page.check(events.querySelector('.hd-events__filters')?.previousElementSibling?.matches('[data-hd-segment="events"]') && events.querySelector('.hd-events__panels')?.previousElementSibling?.matches('.hd-events__filters'), 'Порядок: область, чипы, две части');
    page.check(events.querySelectorAll('[data-widget="V2EventsListTile"], [data-widget="V2EventDetailsTile"]').length === 2 && !events.querySelector('.spl, .splitpane'), 'Оба общих виджета, без Splitter');
    const eventPanels = events.querySelector('.hd-events__panels');
    const eventWidgets = Array.from(eventPanels.querySelectorAll('[data-widget]'));
    page.check(eventWidgets.length === 2 && eventWidgets.every(w => !w.matches('.tile, .tile--headless') && !w.querySelector('.tile__body')), 'Встроенные виджеты без двух Tile-рамок и Tile-body');
    page.check(eventPanels.children.length === 4 && eventPanels.children[1].matches('.dvd.dvd--v[role="separator"][aria-orientation="vertical"]') && eventPanels.children[2].matches('hr.dvd.dvd--h'), 'Между панелями штатный вертикальный Divider и горизонтальный вариант для stack');
    page.check(eventWidgets.every(w => !!w.querySelector('.ds-scroll')) && eventRows().every(r => r.classList.contains('lc-v2-events-list-tile__row')), 'Оба scroll-body сохранены, строки используют локальную геометрию');
    page.check(eventRows().every(r => r.matches('.entity.entity--interactive') && r.parentElement.classList.contains('entity-list') && r.querySelector('.entity__lead .entity__icon i')), 'Каждая строка — Entity с ведущей иконкой типа');
    page.check(eventLink().searchParams.get('scope') === 'my', 'Ссылка открывает «Мои»');
    checkDetails();

    await click('#hd-events [data-event-id]', { index: 1 });
    const keptId = selectedEvent();
    checkDetails();
    await click('[data-hd-event-type="DATA"]');
    page.check(eventChip('DATA').getAttribute('aria-pressed') === 'false', 'Чип типа отжимается');
    page.check(eventRows().every(r => E.all().find(e => e.eventId === r.getAttribute('data-event-id')).typeCode !== 'DATA'), 'События выключенного типа скрыты');
    page.check(eventLink().searchParams.get('types') === 'STATUS,DOCUMENT,TASK,MEETING,CLIENT', 'Включённые типы уходят на страницу в адресе');
    page.check(selectedEvent() === keptId, 'Фильтр сохраняет выбранное событие в видимых 10');
    await click('[data-hd-segment="events"] [data-hd-value="DESK"]');
    page.check(eventLink().searchParams.get('scope') === 'desk' && selectedEvent() === keptId && eventRows().length <= 10, 'Область «Деск» сохраняет выбор и лимит');
    checkDetails();
    const selectedType = E.all().find(e => e.eventId === selectedEvent()).typeCode;
    await click('[data-hd-event-type="' + selectedType + '"]');
    page.check(selectedEvent() === eventRows()[0]?.getAttribute('data-event-id') && selectedEvent() !== keptId, 'Скрытый тип выбора переключает на первое событие');
    checkDetails();
    for (const t of E.types) if (eventChip(t.code).getAttribute('aria-pressed') === 'true') await click('[data-hd-event-type="' + t.code + '"]');
    page.check(eventRows().length === 0 && events.querySelector('[data-events-empty]')?.hidden === false, 'Пустая выборка очищает список');
    page.check(events.querySelector('[data-event-article]')?.hidden === true && events.querySelector('[data-event-none]')?.hidden === false, 'Пустая выборка очищает подробности');
    page.check(!eventLink().searchParams.has('id') && eventLink().searchParams.get('types') === '', 'Пустая выборка передаёт пустые типы без старого id');
    for (const t of E.types) await click('[data-hd-event-type="' + t.code + '"]');
    page.check(selectedEvent() === eventRows()[0]?.getAttribute('data-event-id') && eventRows().length === 10, 'Возвращение типов восстанавливает первое из 10');
    checkDetails();
    // Десятая личная запись выпадает из десятки при расширении до деска.
    await click('[data-hd-segment="events"] [data-hd-value="MY"]');
    await click('#hd-events [data-event-id]', { index: 9 });
    const lastMineId = selectedEvent();
    await click('[data-hd-segment="events"] [data-hd-value="DESK"]');
    page.check(!eventRows().some(r => r.getAttribute('data-event-id') === lastMineId) && selectedEvent() === eventRows()[0]?.getAttribute('data-event-id'), 'Выбор вне новых видимых 10 заменяется первым');
    await click('[data-hd-segment="events"] [data-hd-value="MY"]');
    const keyRow = eventRows()[1];
    keyRow.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await page.wait(0);
    page.check(selectedEvent() === keyRow.getAttribute('data-event-id'), 'Enter выбирает событие');
    const spaceRow = eventRows()[2];
    spaceRow.dispatchEvent(new window.KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    await page.wait(0);
    page.check(selectedEvent() === spaceRow.getAttribute('data-event-id'), 'Space выбирает событие');
    checkDetails();

    page.step('Цвета проверены по CSS, без рендера и геометрии');
    const css = readFileSync(new URL('./HomeDashboard.css', import.meta.url), 'utf8');
    const rules = Array.from(css.matchAll(/([^{}]+)\{([^{}]*)\}/g));
    const declarations = selector => rules.filter(match => match[1].split(',').map(part => part.trim()).includes(selector)).map(match => match[2]).join(';');
    page.check(declarations('.hd-kpi__middle.hd-kpi__middle--summary').includes('gap: var(--space-24)') && declarations('.hd-kpi__middle--summary .hd-kpi__context').includes('text-align: left'), 'Пояснения слева, в 24px от счётчика');
    page.check(/color:\s*var\(--primary\);/.test(declarations('.hd-text-link')), 'Ссылки default используют --primary');
    page.check(/color:\s*var\(--primary-dark\);/.test(declarations('.hd-text-link:hover')), 'Ссылки hover используют --primary-dark');
    page.check(/color:\s*var\(--primary\);/.test(declarations('.hd-kpi__icon')), 'Иконки задач и новостей используют --primary');
    page.check(/color:\s*var\(--st-dpurple\);/.test(declarations('.hd-kpi__icon--ai')) && css.lastIndexOf('.hd-kpi__icon--ai') > css.indexOf('.hd-kpi__icon {'), 'Сиреневая AI-иконка объявлена после базового цвета');
    for (const selector of ['.hd-profile', '.hd-kpi--lavender', '.hd-kpi--ai', '.hd-news']) {
      page.check(/border(?:-color)?:[^;]*color-mix\(in srgb, var\(--st-dpurple\) [68]%, transparent\)/.test(declarations(selector)), selector + ': слабая сиреневая обводка без зелёного');
    }
    page.check(!/border-color\s*:/.test(declarations('a.hd-kpi:hover')), 'Hover не подменяет тон обводки карточки');
    page.check(/opacity:\s*1/.test(declarations('.hd-profile__avatar-frame:hover .hd-profile__avatar-edit')) && /opacity:\s*1/.test(declarations('.hd-profile__avatar-frame:focus .hd-profile__avatar-edit')), 'Карандаш показывается при hover/focus');
  } finally {
    window.DSCopy.write = originalCopy;
    window.DSToast.show = originalToast;
    resetCommand();
  }
}
