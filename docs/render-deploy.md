# Деплой ENRG Oracle на Render (Web Service)

> Пошаговая инструкция для запуска oracle-сервера на Render.com.
> Все секреты (FOUNDER_KEY) добавляются ТОЛЬКО через UI Render — ручная операция.
> Никаких ключей в репозитории не храним.

## 0. Подготовка

- Репозиторий оракла запушен на GitHub (ветка `main`, в корне `package.json` + `server.js`).
- Аккаунт на [render.com](https://render.com) и подключённый GitHub.

## 1. Создание Web Service

1. Render Dashboard → **New** → **Web Service**.
2. Выберите **Connect** у репозитория оракла из списка GitHub.
3. Заполните настройки:

| Поле | Значение |
|---|---|
| Name | `enrg-oracle` |
| Branch | `main` |
| Root Directory | `.` (сервер в корне) — если деплоите вложенный сервис, укажите его каталог |
| Runtime | `Node` |
| Build Command | `npm install --omit=dev` |
| Start Command | `node server.js` |
| Instance Type | Free / Starter (хватит для dev-оракла) |

4. Нажмите **Create Web Service**.

## 2. Добавление секрета FOUNDER_KEY (ручная операция)

1. Откройте созданный сервис → вкладка **Environment**.
2. **Add Secret Variable**:
   - Key: `FOUNDER_KEY`
   - Value: JSON-массив из 64 чисел (приватный ключ founder-кошелька).
     Значение должно быть в формате, который ожидает `JSON.parse` в `server.js`
     (например `[1,2,...,64]`). **Реальный ключ в репозиторий не добавлять.**
3. При необходимости добавьте обычную переменную `PORT=3000`.
4. Render подставит секрет только как env-переменную; он не отображается в логах.

> После изменения Environment Render предложит **Deploy** — подтвердите.

## 3. Health check

1. Вкладка **Settings** → раздел **Health Check**.
2. Health Check Path: `/api/v1/stats`.
3. Сохраните.

## 4. Деплой из GitHub

- Пуш в `main` автоматически запускает новый деплой (если включён
  **Auto-Deploy** — по умолчанию включён).
- Ручной деплой: кнопка **Manual Deploy** → **Deploy latest commit**.

## 5. Проверка

```bash
# URL вида https://enrg-oracle.onrender.com
curl https://enrg-oracle.onrender.com/api/v1/stats
# ожидается: {"total_energy_mwh":0,"active_producers":0,"total_supply":0}
```

В логах сервиса должна появиться строка `🚀 Oracle server listening on port 3000`.

## Важно / безопасность

- `FOUNDER_KEY` — секрет: только через **Add Secret Variable** в Render. Не в коде,
  не в git, не в логах.
- Если ключ не задан — оракул работает без founder-кошелька (on-chain mint недоступен,
  в логах появится предупреждение).
- Фронтенд `enrg-landing` указывает на `http://localhost:3000/api/v1` в `js/config.js`.
  Для работы с удалённым оракулом поменяйте `CONFIG.oracleUrl` на URL Render-сервиса
  (или используйте reverse-proxy с корректным CORS).
