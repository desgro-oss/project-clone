---
screen: Фикстура Б52 spec-head (ok)
zone: тестовый корпус сенсора
role: —
source: не экран продукта; эталон варианта spec-head — список widgets: покрывает все метки <ds-include>, правило молчит
file: .agents/tools/fixtures/Б52@spec-head.src.html
widgets: [tiles/FooTile, modals/FooModal]
---

# Фикстура Б52 — эталон варианта (список совпадает)

Файл не описывает продуктовый экран. Отличается от
`Б52@spec-head.bad.screen.md` одной строкой — списком `widgets:`: здесь он
покрывает обе метки `<ds-include>` исходника, и Б52 молчит.
