#!/usr/bin/env bash
set -euo pipefail

REMOTE="origin"
BRANCH="main"
SERVICE_NAME="shanju"
BASE_URL="http://127.0.0.1:3000"
SKIP_PULL=0
SKIP_INSTALL=0

usage() {
  cat <<'EOF'
Usage: bash scripts/update-and-verify.sh [options]

Options:
  --remote <name>       Git remote (default: origin)
  --branch <name>       Git branch (default: main)
  --service <name>      systemd service name (default: shanju)
  --base-url <url>      Verify base URL (default: http://127.0.0.1:3000)
  --skip-pull           Skip git pull
  --skip-install        Skip npm install
  -h, --help            Show help
EOF
}

log() {
  printf '[update-verify] %s\n' "$1"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --remote)
      REMOTE="${2:-}"
      shift 2
      ;;
    --branch)
      BRANCH="${2:-}"
      shift 2
      ;;
    --service)
      SERVICE_NAME="${2:-}"
      shift 2
      ;;
    --base-url)
      BASE_URL="${2:-}"
      shift 2
      ;;
    --skip-pull)
      SKIP_PULL=1
      shift
      ;;
    --skip-install)
      SKIP_INSTALL=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

require_cmd git
require_cmd npm
require_cmd cp
require_cmd rm

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Current directory is not a git repository." >&2
  exit 1
fi

if [[ "$SKIP_PULL" -eq 0 ]]; then
  log "Pulling latest code from ${REMOTE}/${BRANCH}..."
  git fetch "$REMOTE" "$BRANCH"
  git pull --ff-only "$REMOTE" "$BRANCH"
fi

if [[ "$SKIP_INSTALL" -eq 0 ]]; then
  log "Installing dependencies..."
  npm install --no-fund --no-audit
fi

log "Building project..."
npm run build

if [[ -d ".next/standalone" ]]; then
  log "Syncing standalone static assets..."
  rm -rf .next/standalone/.next/static
  mkdir -p .next/standalone/.next
  cp -r .next/static .next/standalone/.next/static

  rm -rf .next/standalone/public
  cp -r public .next/standalone/public
else
  log "No .next/standalone directory found, skipped standalone sync."
fi

if command -v systemctl >/dev/null 2>&1; then
  if sudo systemctl status "${SERVICE_NAME}" >/dev/null 2>&1 || sudo systemctl status "${SERVICE_NAME}.service" >/dev/null 2>&1; then
    log "Restarting service ${SERVICE_NAME}..."
    sudo systemctl restart "${SERVICE_NAME}"
    sudo systemctl status "${SERVICE_NAME}" --no-pager -l | sed -n '1,30p'
  else
    log "Service ${SERVICE_NAME}.service not found, skip restart."
  fi
else
  log "systemctl not available, skip restart."
fi

log "Running homepage verification..."
npm run verify:home -- "${BASE_URL}"

log "Done."
