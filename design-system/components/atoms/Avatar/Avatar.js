/* =========================================================================
   Avatar.js — рантайм Avatar: разноцветные аватарки (1.006).

   По умолчанию все аватарки одного цвета — нейтральная подложка, рантайм
   ничего не делает. Модуль, спроектированный «разноцветным», включает
   автоокраску атрибутом `data-av-tones` на любом предке (обычно <body>
   экрана). Тогда каждая `.av` с инициалами внутри получает тон палитры
   статусов (`.av--green` / `--lblue` / `--orange` / `--red` / `--dpurple` /
   `--primary`).

   Тон выбирается детерминированно: хеш от `data-av-seed` (модуль кладёт туда
   id или название сущности), иначе от текста инициалов. Один и тот же объект
   всегда одного цвета — на любой странице и после перерисовки.

   Не трогаются:
   - аватарки с явным тоном (`.av--<тон>`, `.av--accent`) — выбор дизайнера
     важнее автоокраски;
   - аватарки с фото (`.av__img`, `image-slot`) и с иконкой (нет `.av__text`);
   - аватарки внутри `data-av-tones="off"` — выключение для части экрана.

   Перерисованные строки (таблица, список) красятся сами: MutationObserver
   собирает изменения и перекрашивает одним проходом в микрозадаче. Явный
   вызов — DSAvatar.refresh(root).

   Экспорт: window.DSAvatar = {
     tone(seed)    → имя тона ('green' …) или null для пустого seed,
     paint(av)     → перекрасить одну аватарку,
     refresh(root) → перекрасить все аватарки внутри root (по умолчанию документ),
     TONES         → тона автоокраски по порядку
   }
   ========================================================================= */
(function () {
  'use strict';

  /* Серый не входит в автоокраску: он почти неотличим от нейтральной
     подложки. Явным модификатором .av--grey он доступен. */
  var TONES = ['green', 'lblue', 'orange', 'red', 'dpurple', 'primary'];
  var ALL = TONES.concat(['grey', 'accent']);

  /* FNV-1a, 32 бита: короткий и устойчивый хеш строки */
  function hash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function tone(seed) {
    var s = String(seed == null ? '' : seed).trim().toLowerCase();
    if (!s) return null;
    return TONES[hash(s) % TONES.length];
  }

  function scopeOn(av) {
    var scope = av.closest('[data-av-tones]');
    return !!scope && scope.getAttribute('data-av-tones') !== 'off';
  }

  function clearAuto(av) {
    var auto = av.getAttribute('data-av-auto');
    if (!auto) return;
    av.classList.remove('av--' + auto);
    av.removeAttribute('data-av-auto');
  }

  function hasExplicit(av) {
    var auto = av.getAttribute('data-av-auto');
    for (var i = 0; i < ALL.length; i++) {
      if (ALL[i] !== auto && av.classList.contains('av--' + ALL[i])) return true;
    }
    return false;
  }

  function paint(av) {
    if (!av || !av.classList || !av.classList.contains('av')) return;
    var text = av.querySelector('.av__text');
    var photo = av.querySelector('.av__img, image-slot');
    if (!scopeOn(av) || hasExplicit(av) || photo || !text) { clearAuto(av); return; }
    var t = tone(av.getAttribute('data-av-seed') || text.textContent);
    if (!t) { clearAuto(av); return; }
    if (av.getAttribute('data-av-auto') === t) return;
    clearAuto(av);
    av.classList.add('av--' + t);
    av.setAttribute('data-av-auto', t);
  }

  function refresh(root) {
    root = root || document;
    var list = root.querySelectorAll ? root.querySelectorAll('[data-av-tones] .av, .av[data-av-auto]') : [];
    for (var i = 0; i < list.length; i++) paint(list[i]);
    if (root.classList && root.classList.contains('av')) paint(root);
  }

  /* Перерисовки: одна перекраска на пачку изменений. Пока на странице нет ни
     одной области data-av-tones и ни одной окрашенной аватарки — проход не
     делается, страницы без разноцветных аватарок ничего не платят. */
  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    Promise.resolve().then(function () {
      queued = false;
      if (document.querySelector('[data-av-tones], .av[data-av-auto]')) refresh(document);
    });
  }

  function boot() {
    refresh(document);
    if (window.MutationObserver && document.documentElement) {
      new MutationObserver(schedule).observe(document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['data-av-tones', 'data-av-seed']
      });
    }
  }

  window.DSAvatar = { tone: tone, paint: paint, refresh: refresh, TONES: TONES.slice() };

  if (document.readyState === 'loading') {
    refresh(document);
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
