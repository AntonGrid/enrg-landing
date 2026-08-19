# Deploy ENRG Oracle on Render (Web Service)

> Step-by-step guide to run the oracle server on Render.com.
> All secrets (FOUNDER_KEY) are added ONLY via the Render UI — manual operation.
> We never store keys in the repository.

## 0. Prerequisites

- The oracle repo is pushed to GitHub (branch `main`, root contains `package.json` + `server.js`).
- An account on [render.com](https://render.com) with GitHub connected.

## 1. Create a Web Service

1. Render Dashboard → **New** → **Web Service**.
2. Click **Connect** next to the oracle repo in the GitHub list.
3. Fill in the settings:

| Field | Value |
|---|---|
| Name | `enrg-oracle` |
| Branch | `main` |
| Root Directory | `.` (server at root) — if you deploy a nested service, point to its directory |
| Runtime | `Node` |
| Build Command | `npm install --omit=dev` |
| Start Command | `node server.js` |
| Instance Type | Free / Starter (enough for a dev oracle) |

4. Click **Create Web Service**.

## 2. Add the FOUNDER_KEY secret (manual operation)

1. Open the created service → **Environment** tab.
2. **Add Secret Variable**:
   - Key: `FOUNDER_KEY`
   - Value: a JSON array of 64 numbers (founder wallet private key).
     The value must be in the format expected by `JSON.parse` in `server.js`
     (e.g. `[1,2,...,64]`). **Do NOT add the real key to the repository.**
3. Optionally add a regular variable `PORT=3000`.
4. Render injects the secret only as an env variable; it is not shown in logs.

> After changing Environment, Render will suggest a **Deploy** — confirm it.

## 3. Health check

1. **Settings** tab → **Health Check** section.
2. Health Check Path: `/api/v1/stats`.
3. Save.

## 4. Deploy from GitHub

- A push to `main` automatically triggers a new deploy (if **Auto-Deploy**
  is enabled — enabled by default).
- Manual deploy: **Manual Deploy** → **Deploy latest commit**.

## 5. Verify

```bash
# URL like https://enrg-oracle.onrender.com
curl https://enrg-oracle.onrender.com/api/v1/stats
# expected: {"total_energy_mwh":0,"active_producers":0,"total_supply":0}
```

The service logs should show `🚀 Oracle server listening on port 3000`.

## Important / security

- `FOUNDER_KEY` is a secret: use **Add Secret Variable** in Render only. Not in code,
  not in git, not in logs.
- If the key is not set — the oracle runs without the founder wallet (on-chain mint is
  unavailable, a warning appears in the logs).
- The `enrg-landing` frontend points to `http://localhost:3000/api/v1` in `js/config.js`.
  To work with a remote oracle, change `CONFIG.oracleUrl` to the Render service URL
  (or use a reverse proxy with correct CORS).

