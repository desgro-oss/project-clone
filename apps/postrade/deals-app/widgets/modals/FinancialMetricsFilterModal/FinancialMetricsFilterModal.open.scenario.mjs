// Приёмка Э9: путь open() окна фильтра на странице (повтор, null, закрытие, утечка состояния).
export default async (page) => {
  const w = page.window; const d = page.document;
  const F = w.PostFinMetricsFilter;
  const scrim = d.getElementById('fm-filter-scrim');
  const IND = [
    { fiId: 'a', fiName: 'ФИ А', currencyCode: 'RUB', metrics: [{ code: 'm1', name: 'M1' }, { code: 'm2', name: 'M2' }] },
    { fiId: 'b', fiName: 'ФИ Б', currencyCode: 'RUB', metrics: [{ code: 'm3', name: 'M3' }] }
  ];
  page.check(!!F && typeof F.preview === 'function', 'API на месте');
  page.step('пустые indicators -> null, окно не открыто');
  const r0 = await F.open({ indicators: [], value: F.empty() });
  page.check(r0 === null && scrim.hidden, 'null при пустых indicators, окно скрыто');
  page.step('open + повторный open -> тот же промис');
  const p1 = F.open({ indicators: IND, value: { fiIds: ['a'], metrics: { a: ['m1'] } } });
  const p2 = F.open({ indicators: IND, value: F.empty() });
  page.check(p1 === p2, 'повторный open возвращает тот же промис');
  await page.wait(80);
  page.check(!scrim.hidden, 'окно открыто');
  const badge = scrim.querySelector('.tab__badge');
  page.check(!badge.hidden && badge.textContent === '1', 'бейдж = 1: ' + badge.textContent);
  page.check(scrim.querySelectorAll('[data-fmf-grid] > *').length === 2, 'поле ФИ + поле индикаторов А');
  page.check(!scrim.querySelector('[data-fmf-clear]').disabled, 'очистить доступна');
  page.step('закрытие крестиком -> null');
  scrim.querySelector('.modal__head [data-modal-close]').click();
  const v1 = await p1;
  page.check(v1 === null, 'крестик -> null: ' + JSON.stringify(v1));
  page.check(scrim.hidden, 'скрим скрыт');
  page.step('повторный open с другим значением, без утечки прежнего выбора');
  const p3 = F.open({ indicators: IND, value: F.empty() });
  await page.wait(60);
  page.check(scrim.querySelectorAll('[data-fmf-grid] > *').length === 1, 'только поле ФИ: ' + scrim.querySelectorAll('[data-fmf-grid] > *').length);
  page.check(scrim.querySelector('.tab__badge').hidden, 'бейдж скрыт');
  page.check(scrim.querySelector('[data-fmf-clear]').disabled, 'очистить выключена');
  page.check(scrim.querySelectorAll('.inp__chips .chip').length === 0, 'чипов нет');
  scrim.querySelector('[data-fmf-apply]').click();
  const v3 = await p3;
  page.check(v3 && v3.fiIds.length === 0, 'Применить с пустым -> пустое значение (не null): ' + JSON.stringify(v3));
  page.step('open -> выбрать ФИ Б -> применить');
  const p4 = F.open({ indicators: IND, value: F.empty() });
  await page.wait(60);
  const opt = [...scrim.querySelectorAll('[data-fmf-fi] .ddl__item[data-value="b"]')][0];
  page.check(!!opt, 'опция ФИ Б есть');
  if (opt) { opt.click(); await page.wait(40); }
  page.check(scrim.querySelectorAll('[data-fmf-grid] > *').length === 2, 'появилось поле индикаторов Б');
  scrim.querySelector('[data-fmf-apply]').click();
  const v4 = await p4;
  page.check(v4 && v4.fiIds.join() === 'b', 'результат b: ' + JSON.stringify(v4));
  page.step('Esc после открытия');
  const p5 = F.open({ indicators: IND, value: v4 });
  await page.wait(60);
  page.check(scrim.querySelector('.tab__badge').textContent === '1', 'значение вкладки подставлено');
  const ids = [...scrim.querySelectorAll('[id]')].map((e) => e.id);
  page.check(new Set(ids).size === ids.length, 'id внутри окна уникальны');
  scrim.querySelector('.modal__head [data-modal-close]').click();
  page.check((await p5) === null, 'закрыто без применения -> null');
  // заведомо падающая проверка: убеждаемся, что сценарий умеет падать
  if (page.query && page.query.get && page.query.get('forcefail')) page.check(false, 'ожидаемое падение');
};
