// Ключевое поведение страницы предложений (RE0050, 05.11.2026): все предложения рассмотрены,
// карточек на обсуждении нет; №4 отклонён — позже будет нормальное редактирование. Запуск:
//   node .agents/tools/page-run.mjs apps/postrade/drafts/tranche-page-v04-proposals/pages/Proposals.html \
//     --scenario apps/postrade/drafts/tranche-page-v04-proposals/pages/Proposals.scenario.mjs --no-flows
export default async (page) => {
  const d = page.document;
  await page.wait(300);
  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ') : '');
  page.check(d.querySelectorAll('.pr-card').length === 0, 'карточек предложений на обсуждении нет: ' + d.querySelectorAll('.pr-card').length);
  page.check(text(d.querySelector('.phead__chips')).includes('Рассмотрены'), 'чип страницы «Рассмотрены»');
  page.check(text(d.querySelector('.es__title')) === 'Предложений на обсуждении нет', 'пустое состояние «Предложений на обсуждении нет»');
  page.check(text(d.querySelector('.es__text')).includes('позже появится нормальное редактирование'), 'в пустом состоянии — нормальное редактирование вместо дублирования');
  page.check(text(d.querySelector('.pr-lead')).includes('№4 «Дублировать корректировку» отклонён'), 'во вводном тексте №4 отклонён');
};
