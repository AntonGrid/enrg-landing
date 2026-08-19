# Docker for ENRG Oracle

> Goal: local or production run of the oracle server (`server.js`) in a container.
> IMPORTANT: this repository (`enrg-landing`) contains only docs/examples.
> The oracle code lives in a separate repository (referred to as "oracle repo",
> root: `package.json` + `server.js`). The Docker build context is the oracle repo root.

## Oracle facts (for configuration)

| Parameter | Value |
|---|---|
| Port | `3000` (overridable via env `PORT`) |
| Healthcheck | `GET /api/v1/stats` → `{"total_energy_mwh":...,"active_producers":...}` |
| Storage | SQLite `./enrg.db` (auto-created next to `server.js`) |
| Native modules | `better-sqlite3` — requires compilation on Alpine (python3/make/g++) |
| Secrets | `FOUNDER_KEY` — JSON array (64 numbers) of the founder wallet private key. Passed ONLY via env/secret. **NEVER commit or log it.** |

## Example Dockerfile

Place in the oracle repo root as `Dockerfile`:

```dockerfile
FROM node:18-alpine

# build tools for the native better-sqlite3 module
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Dependencies first — layer is cached on rebuilds
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Oracle sources
COPY server.js ./

ENV PORT=3000
EXPOSE 3000

# Healthcheck: GET /api/v1/stats
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/v1/stats >/dev/null 2>&1 || exit 1

CMD ["node", "server.js"]
```

### Build

```bash
# from the oracle repo root
docker build -t enrg-oracle:latest .
```

### Run (docker run) with FOUNDER_KEY as env

`FOUNDER_KEY` — the founder wallet private key. Pass it **only** via an environment
variable. The command below shows the passing mechanism, NOT the key itself:

```bash
# The secret comes from the launching machine env (e.g. already set in CI/Render).
# Do NOT paste the real value directly into the command.
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

Verify:

```bash
curl http://localhost:3000/api/v1/stats
# expected: {"total_energy_mwh":0,"active_producers":0,"total_supply":0}
docker logs enrg-oracle   # look for: "🚀 Oracle server listening on port 3000"
```

## SQLite persistence

`server.js` creates the DB as `./enrg.db` (relative to the working dir `/app`).
To keep data across restarts, mount a volume:

```bash
# options:
# 1) file mount (the file must exist):
#    docker run ... -v $(pwd)/enrg.db:/app/enrg.db ...
# 2) named volume on /app (will overwrite node_modules — a re-run of
#    npm install inside the container will be required):
#    docker run ... -v oracle-data:/app ...
```

For local development docker-compose is more convenient — see `docker-compose-example.yaml`.

## Security

- `FOUNDER_KEY` is a secret. Never put it in the Dockerfile, compose file or git.
- If the oracle runs without `FOUNDER_KEY`, it warns and runs in a restricted mode
  (on-chain mint will be unavailable).
- How to add the secret on Render — in `render-deploy.md`.

