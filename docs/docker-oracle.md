# Docker для ENRG Oracle

> Цель: локальный или продовый запуск oracle-сервера (`server.js`) в контейнере.
> ВАЖНО: этот репозиторий (`enrg-landing`) содержит только документацию/примеры.
> Код оракла живёт в отдельном репозитории (далее — «репозиторий оракла»,
> корень: `package.json` + `server.js`). Docker-контекст сборки = корень репозитория оракла.

## Факты об оракла (для конфигурации)

| Параметр | Значение |
|---|---|
| Порт | `3000` (переопределяется env `PORT`) |
| Healthcheck | `GET /api/v1/stats` → `{"total_energy_mwh":...,"active_producers":...}` |
| Хранилище | SQLite `./enrg.db` (создаётся автоматически рядом с `server.js`) |
| Нативные модули | `better-sqlite3` — требует компиляцию в Alpine (python3/make/g++) |
| Секреты | `FOUNDER_KEY` — JSON-массив (64 числа) приватного ключа founder-кошелька. Передаётся ТОЛЬКО через env/secret. **НИКОГДА не коммитить и не логировать.** |

## Пример Dockerfile

Поместите в корень репозитория оракла как `Dockerfile`:

```dockerfile
FROM node:18-alpine

# build-инструменты для нативного модуля better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Сначала зависимости — слой кэшируется при пересборке
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Исходники оракла
COPY server.js ./

ENV PORT=3000
EXPOSE 3000

# Healthcheck: GET /api/v1/stats
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/v1/stats >/dev/null 2>&1 || exit 1

CMD ["node", "server.js"]
```

### Сборка

```bash
# из корня репозитория оракла
docker build -t enrg-oracle:latest .
```

### Запуск (docker run) с FOUNDER_KEY как env

`FOUNDER_KEY` — приватный ключ founder-кошелька. Передайте его **только** через переменную
окружения. Ниже показан способ передачи, но НЕ сам ключ:

```bash
# Секрет берётся из окружения запускающей машины (например, уже задан в CI/Render).
# НЕ вставляйте реальное значение прямо в команду.
docker run -d --name enrg-oracle \
  -p 3000:3000 \
  -e PORT=3000 \
  -e FOUNDER_KEY="${FOUNDER_KEY}" \
  --health-cmd "wget -qO- http://127.0.0.1:3000/api/v1/stats >/dev/null 2>&1 || exit 1" \
  --health-interval 30s \
  --health-timeout 3s \
  --health-start-period 15s \
  --health-retries 3 \
  enrg-oracle:latest
```

Проверка:

```bash
curl http://localhost:3000/api/v1/stats
# ожидается: {"total_energy_mwh":0,"active_producers":0,"total_supply":0}
docker logs enrg-oracle   # ищем: "🚀 Oracle server listening on port 3000"
```

## Персистентность SQLite

`server.js` создаёт БД как `./enrg.db` (относительно рабочего каталога `/app`).
Для сохранения данных между перезапусками смонтируйте том:

```bash
# варианты:
# 1) файловый маунт (файл должен существовать):
#    docker run ... -v $(pwd)/enrg.db:/app/enrg.db ...
# 2) named volume на каталог /app (перезапишет node_modules — потребуется
#    повторный npm install внутри контейнера):
#    docker run ... -v oracle-data:/app ...
```

Для локальной разработки удобнее docker-compose — см. `docker-compose-example.yaml`.

## Безопасность

- `FOUNDER_KEY` — секрет. Никогда не помещайте его в Dockerfile, compose-файл или git.
- Если оракул запущен без `FOUNDER_KEY`, он предупреждает и работает в ограниченном режиме
  (on-chain mint будет недоступен).
- Способ добавить секрет на Render — в `render-deploy.md`.
