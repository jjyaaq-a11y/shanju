#!/bin/bash
# 媒体表结构迁移（幂等）
# 运行: ./scripts/migrate-media-schema.sh 或 bash scripts/migrate-media-schema.sh

set -euo pipefail

DB="${1:-payload.db}"
cd "$(dirname "$0")/.." || exit 1

add_col() {
  local table=$1
  local col=$2
  local typ=$3
  if ! sqlite3 "$DB" "SELECT 1 FROM pragma_table_info('$table') WHERE name='$col';" | grep -q 1; then
    sqlite3 "$DB" "ALTER TABLE $table ADD COLUMN $col $typ;"
    echo "Added column: $table.$col"
  fi
}

add_col media rotation text
