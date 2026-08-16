## Описание изменений
Кратко опишите, что сделано и зачем.

## Изменённые файлы (ключевые)
- (перечислить ключевые файлы)

## Как тестировать (чек‑лист)
- [ ] Открыть dashboard.html с подключённым Phantom: pubkey виден, кнопка ↻ Refresh работает, stat‑карточки обновляются.
- [ ] Остановить локальный оракл: увидеть toast «retrying in Ns» и рост backoff (2s→4s→8s→16s→32s→60s).
- [ ] Перезапустить оракл: убедиться в сбросе backoff и восстановлении обновлений.
- [ ] Проверить SRC balance: без токенов → 0; с тестовыми токенами → корректное значение.
- [ ] Проверить docs: нет секретов, docker-compose валиден.
- [ ] Выполнен curl health-check на окружении (prod/dev): /api/v1/stats возвращает корректный JSON.

## Безопасность
- [ ] Убедился(ась), что в коммите/PR нет реальных секретов (FOUNDER_KEY не в репо)
- [ ] Если требуется — секреты добавлены в окружение хоста/Render вручную

## Деплой (коротко)
- Render: branch=main, root='.', build=`npm install --omit=dev`, start=`node server.js`, health=`/api/v1/stats`
- Добавить FOUNDER_KEY как Secret в Render → Environment → Add Secret Variable

## PR Checklist (для мёрджа)
- [ ] Smoke-test пройден
- [ ] Secrets проверены
- [ ] Health check на проде OK
- [ ] Release notes обновлены
