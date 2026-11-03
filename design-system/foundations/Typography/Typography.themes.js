/* ============================================================
   Typography.themes.js — выбор типографской темы (RE0048, Э3).

   Типографика — отдельное измерение рядом с цветами: свой
   атрибут на <html> (data-typography), своё хранилище
   (localStorage, ds.typography), своё событие и параметр адреса
   (?typography=). Правила темы — Typography.themes.css; базовая
   тема — без атрибута, как legacy у цветовых.

   Рантаймов ДС не требует (в отличие от Themes.js) — работает
   и без данных тем.

   API window.DSTypography (контракт DSTheme):
     get()       — id текущей темы: 'base' | 'neo';
     set(id)     — выбрать тему, вернёт итоговый id;
     list()      — темы для меню: { id, name, label };
     normalize(id) — разобрать id в тему или null.
   Событие на document: ds:typographychange (detail { typography }).
   ============================================================ */
(function () {
  'use strict';
  if (window.DSTypography) return;

  var STORAGE_KEY = 'ds.typography';
  var THEMES = [
    { id: 'base', name: 'Базовая' },
    { id: 'neo', name: 'NEO' }
  ];

  function normalize(id) {
    id = String(id || '').toLowerCase();
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i].id === id) return THEMES[i];
    }
    return null;
  }

  function apply(theme) {
    if (!theme || theme.id === 'base') document.documentElement.removeAttribute('data-typography');
    else document.documentElement.setAttribute('data-typography', theme.id);
  }

  function get() {
    return document.documentElement.getAttribute('data-typography') || 'base';
  }

  function emit() {
    document.dispatchEvent(new CustomEvent('ds:typographychange', {
      detail: { typography: get() }
    }));
  }

  function remember(id) {
    try {
      if (id === 'base') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, id);
    } catch (e) { /* хранилище недоступно — выбор живёт до перезагрузки */ }
  }

  function set(id) {
    var next = normalize(id);
    if (!next) {
      console.warn('DSTypography: неизвестная тема ' + id);
      return get();
    }
    apply(next);
    remember(next.id);
    emit();
    return get();
  }

  function list() {
    return THEMES.map(function (t) {
      return { id: t.id, name: t.name, label: t.name };
    });
  }

  window.DSTypography = {
    get: get,
    set: set,
    list: list,
    normalize: normalize
  };

  /* Начальная тема: ?typography=, затем localStorage. Неизвестный id
     переписывается в хранилище итоговым. */
  var requested = '';
  try {
    requested = new URLSearchParams(window.location.search).get('typography') || localStorage.getItem(STORAGE_KEY) || '';
  } catch (e) { /* хранилище недоступно */ }
  var initial = normalize(requested);
  if (initial) apply(initial);
  if (requested && initial && requested !== initial.id) {
    try { localStorage.setItem(STORAGE_KEY, initial.id); } catch (e) { /* хранилище недоступно */ }
  }
})();
