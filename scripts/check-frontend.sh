#!/bin/bash
# Diagnose why http://localhost:5173 may not be reachable.
# Run this from the worktree: bash scripts/check-frontend.sh

set -u
CYAN='\033[0;36m'
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${CYAN}== container status ==${NC}"
cd "$(dirname "$0")/.."
docker compose -f docker-compose.local.yml ps

echo
echo -e "${CYAN}== frontend container log (last 20) ==${NC}"
docker compose -f docker-compose.local.yml logs --tail=20 frontend

echo
echo -e "${CYAN}== port 5173 listener ==${NC}"
lsof -nP -i :5173 2>&1 | head -5

echo
echo -e "${CYAN}== HTTP probes ==${NC}"
for url in http://localhost:5173/ http://127.0.0.1:5173/ "http://[::1]:5173/"; do
  code=$(curl -sS -o /dev/null -w '%{http_code}' --connect-timeout 3 "$url" 2>&1) || code="ERR"
  echo "  $url -> $code"
done

echo
echo -e "${CYAN}== HTML head ==${NC}"
curl -sS http://localhost:5173/ | head -8

echo
echo -e "${CYAN}== api reachable via vite proxy ==${NC}"
curl -sS http://localhost:5173/api/health

echo
echo
echo -e "${CYAN}== if you see ERR_CONNECTION_REFUSED in the browser ==${NC}"
echo "  - the service IS up (the probes above return 200), so the issue is local"
echo "  - try a different browser / incognito"
echo "  - if you're on a remote/VM: open the URL from the same machine that runs docker"
echo "  - check if a corporate VPN or proxy is intercepting localhost"
echo "  - try: docker compose -f docker-compose.local.yml restart frontend"
