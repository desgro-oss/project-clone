/* Фикстура сенсора: скрипт виджета дерева В НОРМЕ. Строку узла собирает
   шаблон в подключённом файле, как у виджета widgets/<группа>/<Имя>/<Имя>.js;
   базовый глиф кнопки раскрытия смотрит вправо, раскрытый узел поворачивает
   его CSS TableCell (вход правила Б40 через подключённый скрипт, эталон
   варианта _widget-js.ok.html, урок Л259). */
var fxTreeRow = '<div class="tc tc--tree"><button type="button" class="tc__twisty" aria-expanded="false" aria-label="Развернуть"><i data-icon="chevron-right"></i></button><span class="tc__row"><span class="tc__text">ГК «Цветы»</span></span></div>';
