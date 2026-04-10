#!/usr/bin/env bash
set -euo pipefail

REMOTE="origin"
BRANCH="main"
DB_FILE="payload.db"
BACKUP_DIR="./backups"
SERVICE_NAME="shanju"
SKIP_BUILD=0
INIT_DB=0
FORCE_SEED=0
RESTART_SERVICE=1

usage() {
  cat <<'EOF'
Usage: bash scripts/deploy-server.sh [options]

Options:
  --remote <name>         Git remote (default: origin)
  --branch <name>         Git branch (default: main)
  --db-file <path>        SQLite db file path (default: payload.db)
  --backup-dir <path>     Backup directory (default: ./backups)
  --service <name>        systemd service to restart (default: shanju)
  --skip-build            Skip npm run build
  --init-db               Run db migration and seed steps
  --force-seed            Seed even if data already exists (use with --init-db)
  --no-restart            Do not restart systemd service
  -h, --help              Show this help
EOF
}

log() {
  printf '[deploy] %s\n' "$1"
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
    --db-file)
      DB_FILE="${2:-}"
      shift 2
      ;;
    --backup-dir)
      BACKUP_DIR="${2:-}"
      shift 2
      ;;
    --service)
      SERVICE_NAME="${2:-}"
      shift 2
      ;;
    --skip-build)
      SKIP_BUILD=1
      shift
      ;;
    --init-db)
      INIT_DB=1
      shift
      ;;
    --force-seed)
      FORCE_SEED=1
      shift
      ;;
    --no-restart)
      RESTART_SERVICE=0
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
require_cmd sqlite3
require_cmd date

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Current directory is not a git repository." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit/stash changes before deploy." >&2
  exit 1
fi

log "Pulling latest code from ${REMOTE}/${BRANCH}..."
git fetch "$REMOTE" "$BRANCH"
git pull --ff-only "$REMOTE" "$BRANCH"

log "Installing dependencies..."
npm install --no-fund --no-audit

if [[ "$SKIP_BUILD" -eq 0 ]]; then
  log "Building application..."
  npm run build
fi

mkdir -p "$BACKUP_DIR"
if [[ -f "$DB_FILE" ]]; then
  TS="$(date +%Y%m%d-%H%M%S)"
  BACKUP_FILE="${BACKUP_DIR}/$(basename "$DB_FILE").${TS}.bak"
  log "Backing up database to ${BACKUP_FILE}..."
  cp "$DB_FILE" "$BACKUP_FILE"
else
  log "Database file ${DB_FILE} not found, skipping backup."
fi

if [[ "$INIT_DB" -eq 1 ]]; then
  log "Running db schema migration..."
  npm run migrate:media
  npm run migrate:routes

  ROUTES_COUNT="$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM routes;" 2>/dev/null || echo 0)"
  JOURNALS_COUNT="$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM journals;" 2>/dev/null || echo 0)"

  if [[ "$FORCE_SEED" -eq 1 || "$ROUTES_COUNT" -eq 0 ]]; then
    log "Seeding routes..."
    npm run seed:routes
  else
    log "Skipping route seed (routes already has ${ROUTES_COUNT} rows)."
  fi

  if [[ "$FORCE_SEED" -eq 1 || "$JOURNALS_COUNT" -eq 0 ]]; then
    log "Seeding site content..."
    npm run seed:site
  else
    log "Skipping site seed (journals already has ${JOURNALS_COUNT} rows)."
  fi
fi

if [[ "$RESTART_SERVICE" -eq 1 ]]; then
  if command -v systemctl >/dev/null 2>&1 && systemctl list-unit-files | grep -q "^${SERVICE_NAME}\.service"; then
    log "Restarting service ${SERVICE_NAME}..."
    sudo systemctl restart "${SERVICE_NAME}"
    sudo systemctl status "${SERVICE_NAME}" --no-pager -l | sed -n '1,40p'
  else
    log "systemd service ${SERVICE_NAME}.service not found, skipping restart."
  fi
fi

log "Deployment completed."
