# ENRG Landing — Release Notes

> Дата: 2026-08-14 · Ветка: `main` · Репозиторий: `enrg-landing`
> Статус: MVP готов к локальному тестированию и ручному деплою оракла.

## Что сделано

Превращение статичного лендинга в рабочий dApp MVP (6 коммитов в `main`):

| Коммит | Содержимое |
|---|---|
| `wallet: add Phantom connect/disconnect and header UI` | Подключение Phantom (`window.solana`), персистентность pubkey в `localStorage["enrg_pubkey"]`, кнопка Connect/Disconnect, короткий адрес (4…4), ссылка «Install Phantom» → phantom.app |
| `register: generate device keypair in-browser and register to oracle` | Кнопка «Register device (simulate)»: генерация Ed25519 (tweetnacl) в браузере, сохранение device в localStorage, `POST /api/v1/device/register` |
| `proof: add simulate-proof flow, sign message in-browser and submit to oracle` | Подпись `msg = device_id\|timestamp\|energyWh\|nonce` на клиенте, `POST /api/v1/proof/submit`, nonce/energy в localStorage, обработка InvalidNonce/invalid signature |
| `dashboard: improve polling with backoff, add manual refresh and wallet SRC balance` | Live-polling `/stats` с экспоненциальным бэкоффом (2s→60s), кнопка Refresh, throttle статусов устройств (5s), SRC balance через RPC |
| `ui: add neon/glass theme variables and basic styles for hero and cards` | `--accent/--accent-2/--glass-*`, `.glass-panel`, neon glow кнопок, animated hero gradient |
| `docs: add docker and Render deployment guides for oracle (no secrets)` | `docs/docker-oracle.md`, `docs/render-deploy.md`, `docs/docker-compose-example.yaml` |

## Ключевые файлы

- `js/wallet.js`, `js/wallet-ui.js` — Phantom-адаптер и header UI
- `js/device-store.js`, `js/device-proof.js`, `js/simulate-buttons.js` — устройства, подпись proof, кнопки
- `js/api.js` — `postRegisterDevice`, `postProof`, `getDeviceStatus`, `getWalletTokenBalance`, `fetchProtocolStats`
- `js/config.js` — конфиг; `oracleUrl` переопределяется через `window.ENRG_ORACLE_URL`
- `index.html`, `register.html`, `dashboard.html`, `css/style.css`

## Как тестировать

1. Запустить локальный оракл (`node server.js` в репозитории оракла, порт 3000).
2. `index.html` → «Connect Wallet» (Phantom) → pubkey в шапке.
3. `register.html` → «Register device (simulate)» → устройство появляется в списке.
4. «Simulate proof (250 Wh)» → `ok:true, accumulated`, nonce/energy растут.
5. `dashboard.html` → stats каждые 15s, кнопка Refresh, SRC balance.
6. Backoff: остановить оракл → toast «retrying in Ns» (2s→…→60s), после перезапуска — сброс.

## Чек-лист для ревьюеров

- [ ] Phantom connect/disconnect работает, pubkey сохраняется в localStorage и восстанавливается после перезагрузки
- [ ] Без Phantom кнопка показывает «Install Phantom» и ведёт на phantom.app
- [ ] Регистрация устройства: ключи генерируются в браузере, секретный ключ не уходит на сервер
- [ ] Proof: подпись формируется клиентом, `msg` совпадает с серверным форматом (`device_id|timestamp|energyWh|nonce`)
- [ ] InvalidNonce — автоматический синк nonce с ораклом; invalid signature — nonce не инкрементируется
- [ ] Dashboard: stats обновляются, кнопка Refresh работает, backoff корректно растёт и сбрасывается
- [ ] SRC balance: без токенов → 0, с токенами → значение
- [ ] UI: glass/neon применён без изменения JS-селекторов
- [ ] Доки: `docs/` не содержат секретов, инструкции по Render полные
- [ ] В git нет `FOUNDER_KEY` и других секретов (проверка `grep -rniE "founder.?key.?[=:][[:space:]]*\\[" docs/` — пусто)

## Деплой (ручная операция)

Прод-деплой оракла выполняется вручную (нужен доступ к Render + секрет `FOUNDER_KEY`):

1. Render → New → Web Service → репозиторий оракла, branch `main`, root `.`
2. Build: `npm install --omit=dev` · Start: `node server.js` · Health: `/api/v1/stats`
3. Render → Environment → **Add Secret Variable** → `FOUNDER_KEY` = JSON-массив ключа
4. После деплоя: `curl https://<render-url>/api/v1/stats`
5. Во фронтенде: `<script>window.ENRG_ORACLE_URL="https://<render-url>/api/v1";</script>` перед подключением модулей

Подробнее: `docs/docker-oracle.md`, `docs/render-deploy.md`.
