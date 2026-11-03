/* Фикстура сенсора: ДЕФЕКТ Б40 в скрипте виджета дерева. Строку узла
   собирает шаблон в подключённом файле, а базовый глиф кнопки раскрытия
   смотрит вниз: CSS раскрытого узла поворачивает кнопку на 90°, и у
   раскрытого холдинга стрелка уходит влево (вход Б40@widget-js.bad.html,
   урок Л259). */
var fxTreeRow = '<div class="tc tc--tree"><button type="button" class="tc__twisty" aria-expanded="false" aria-label="Развернуть"><i data-icon="chevron-down"></i></button><span class="tc__row"><span class="tc__text">ГК «Цветы»</span></span></div>';
