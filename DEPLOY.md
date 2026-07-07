# Deploying LanguageMe to Production

LanguageMe runs on a single **DigitalOcean droplet** as a Docker Compose stack
behind Caddy. The React frontend is **built locally** and served as static files;
the Express API and PostgreSQL run as containers.

## Server Details

| Property | Value |
|----------|-------|
| Host | `188.166.87.234` (DigitalOcean droplet, Ubuntu 24.04) |
| SSH user | `root` |
| SSH key | `~/.ssh/do_languageme` (ed25519, comment `languageme-droplet`) |
| App directory | `/opt/languageme` |
| Domain | `languageme.dpdns.org` (DNS via Cloudflare) |
| Stack | Docker Compose: `postgres` + `api` + `caddy` |
| Public ports | 80, 443 (Caddy). 3000 (api) and 5432 (postgres) are also published but only needed internally. |
| Memory | ~2 GB RAM, **no swap** — do NOT build the frontend on the server. |

The frontend is **not** containerized in prod. `docker-compose.prod.yml` disables the
Vite `frontend` dev service and adds a `caddy` service that serves the pre-built
`dist/` directory and reverse-proxies `/api/*` to the `api` container.

## SSH Setup

The key already exists at `~/.ssh/do_languageme`. Add a host alias to `~/.ssh/config`
so commands don't need the `-i` flag:

```ssh-config
Host languageme
    HostName 188.166.87.234
    User root
    IdentityFile ~/.ssh/do_languageme
    IdentitiesOnly yes
```

Verify:

```bash
ssh-keygen -l -f ~/.ssh/do_languageme.pub   # SHA256:KLUFdpXGMAl13Oq/VLTB3aspgvDUjnhVkJ/6GSRa434
ssh languageme "whoami && docker compose version"
```

If the droplet is rebuilt and you get `REMOTE HOST IDENTIFICATION HAS CHANGED`:

```bash
ssh-keygen -R 188.166.87.234
# Re-add the public key via the DigitalOcean console:
#   echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHBNu5UAKWJRwNJFEYJT6mFRxMq2r/8vLdVYqOR4Kk3o languageme-droplet' >> /root/.ssh/authorized_keys
```

## Environment Variables

Runtime secrets live in `/opt/languageme/.env` on the server (chmod 600, never committed).
`docker-compose.yml` interpolates them via `${VAR}`. Required keys:

| Key | Purpose |
|-----|---------|
| `JWT_SECRET` | Access-token signing secret (random, 32+ bytes) |
| `JWT_REFRESH_SECRET` | Refresh-token signing secret (random, 32+ bytes) |
| `PUBLIC_URL` | `https://languageme.dpdns.org` — base for OAuth callbacks |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `NVIDIA_API_KEY` | AI provider key (NVIDIA Nemotron) |
| `OPENCODE_API_KEY` | AI provider key |
| `AI_BASE_URL` / `AI_MODEL` | AI provider config (defaults set in compose) |

`DATABASE_URL`, the JWT secrets, and `PORT` have safe fallbacks baked into
`docker-compose.yml`. The JWT fallbacks are **dev-only**; production MUST set real
`JWT_SECRET` / `JWT_REFRESH_SECRET` in `.env`, otherwise tokens are signed with the
public dev secret.

**Push secrets without leaking them into your shell history / transcript.** Pipe
matching lines straight from the local `.env` into the server file:

```bash
# Append new keys (verify they aren't already present first)
grep -E '^(GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET)=' .env \
  | ssh languageme 'umask 077; cat >> /opt/languageme/.env'

# PUBLIC_URL must be the prod URL, not the local one:
ssh languageme 'grep -q "^PUBLIC_URL=" /opt/languageme/.env || echo "PUBLIC_URL=https://languageme.dpdns.org" >> /opt/languageme/.env'
```

> **OAuth gotcha:** for Google login to work in prod, the redirect URI
> `https://languageme.dpdns.org/api/auth/google/callback` must be registered in the
> Google Cloud console (APIs & Services → Credentials → the OAuth client).

## Deploy (code/content update)

Use `scripts/deploy.sh` (see below) or run the steps manually. **Always build locally** —
the 2 GB / no-swap droplet will OOM on a Vite build.

```bash
# 1. Build the frontend locally from a clean checkout of origin/main
git fetch origin
git checkout origin/main      # or deploy from a worktree pinned to origin/main
npm ci
npm run build                 # → dist/

# 2. Sync built frontend + backend source + compose/Caddy config to the droplet
#    (node_modules/.git excluded; api deps install during the image build)
rsync -avz --delete dist/        languageme:/opt/languageme/dist/
rsync -avz --delete \
  --exclude node_modules --exclude .env \
  server/                        languageme:/opt/languageme/server/
rsync -avz docker-compose.yml docker-compose.prod.yml Caddyfile \
                                 languageme:/opt/languageme/

# 3. Rebuild the api image (picks up new code + new npm deps) and recreate
#    api + caddy. postgres keeps running with its persisted volume.
ssh languageme 'cd /opt/languageme && \
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build api caddy'

# 4. Run DB migrations inside the api container (NOT auto-run on boot)
ssh languageme 'cd /opt/languageme && \
  docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T api npm run migrate'

# 5. Verify (see below)
```

## Verification

```bash
# Containers healthy
ssh languageme 'cd /opt/languageme && docker compose -f docker-compose.yml -f docker-compose.prod.yml ps'

# API health through Caddy (HTTPS) and directly
curl -sf https://languageme.dpdns.org/api/themes >/dev/null && echo "API OK via Caddy"

# Frontend served
curl -sI https://languageme.dpdns.org/ | head -1

# Recent api logs
ssh languageme 'cd /opt/languageme && docker compose logs --tail=40 api'
```

## Rollback

The previous frontend/back-end is whatever is in the last image + `dist/`. Fastest paths:

```bash
# Rebuild & redeploy a known-good commit
git checkout <previous-commit>
npm ci && npm run build
# ...repeat rsync + up --build from the deploy steps above

# Or, if only the api misbehaves, roll back to the previous image and restart:
ssh languageme 'cd /opt/languageme && docker compose -f docker-compose.yml -f docker-compose.prod.yml restart api'
```

Postgres data is on the `pgdata` named volume and survives `up --build` / `restart`.
Do **not** run `docker compose down -v` — `-v` deletes the database volume.

## Pitfalls

1. **Never build on the server.** ~2 GB RAM, no swap → Vite build OOMs. Build locally, rsync `dist/`.
2. **Migrations are manual.** The api does not run migrations on startup. Run
   `docker compose ... exec -T api npm run migrate` after every deploy that adds a migration.
3. **JWT secret rotation logs everyone out.** Changing `JWT_SECRET` invalidates all
   existing access/refresh tokens; users must log in again. Expected on first hardening.
4. **Cloudflare is in front.** DNS resolves to Cloudflare IPs. If TLS/Caddy behaves
   oddly, check the Cloudflare SSL mode (should be Full) and that Caddy can still
   complete its ACME challenge.
5. **Don't `down -v`.** It destroys the `pgdata` volume (all user accounts/progress).
6. **`.env` is not synced by rsync** (excluded). Manage server secrets in place.
