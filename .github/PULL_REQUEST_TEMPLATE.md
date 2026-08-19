## Описание изменений
Кратко опишите, что сделано и зачем.

## Изменённые файлы (ключевые)
- (перечислить ключевые файлы)

## Как тестировать (чек‑лист)
- [ ] `npm run build` в `enrg-landing` проходит без ошибок.
- [ ] Кнопка «Подключить устройство» ведёт на `https://antongrid.github.io/Axis-connect/` в новом табе.
- [ ] Меню HOME · DASHBOARD · MINTING · HISTORY · SETTINGS работает (якоря / внешние ссылки).
- [ ] Статистика: при живом оракуле `https://enrg-oracle.onrender.com/api/v1/stats` — бейдж LIVE; при недоступности — DEMO-заглушки с анимацией SYNC.
- [ ] Секции лендинга отображаются на десктопе, планшете и телефоне.
- [ ] Legacy-страницы `/legacy/whitepaper.html` и `/legacy/technical-overview.html` открываются.

## Деплой (коротко)
- GitHub Pages через Actions (`.github/workflows/deploy.yml`): push в `main`.
- CNAME `enrg.network` копируется из `public/` в `dist/`.
- В настройках репозитория → Pages источник должен быть «GitHub Actions».

## Безопасность
- [ ] В коммите нет реальных секретов.
- [ ] Внешние ссылки используют `rel="noopener noreferrer"`.

## PR Checklist (для мёрджа)
- [ ] Smoke-test пройден (`npm run build`)
- [ ] Ссылки проверены
- [ ] Release notes обновлены

