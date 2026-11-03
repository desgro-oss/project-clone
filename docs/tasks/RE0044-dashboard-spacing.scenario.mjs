// Структурная проверка верхнего поля страницы без хлебных крошек.
// Геометрия и CSS-каскад моделью page-run не измеряются.
export default async page => {
  const css = [...page.document.querySelectorAll('style')].map(style => style.textContent).join('\n');
  page.check(!page.document.querySelector('.screen > .crumbs'), 'дашборд — стартовая страница без крошек');
  page.check(/\.screen\s*\{[^}]*--layout-pad-top:\s*var\(--space-24\)/.test(css), 'страница без крошек задаёт верхнее поле токеном space-24');
};
