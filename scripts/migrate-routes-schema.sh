#!/bin/bash
# 路线表结构迁移（幂等）
# 运行: ./scripts/migrate-routes-schema.sh 或 bash scripts/migrate-routes-schema.sh

DB="${1:-payload.db}"
cd "$(dirname "$0")/.." || exit 1

add_col() {
  local col=$1
  local typ=$2
  if ! sqlite3 "$DB" "SELECT 1 FROM pragma_table_info('routes') WHERE name='$col';" | grep -q 1; then
    sqlite3 "$DB" "ALTER TABLE routes ADD COLUMN $col $typ;"
    echo "Added column: $col"
  fi
}

add_col overview_zh text
add_col overview_en text
add_col travel_tips_zh text
add_col travel_tips_en text
add_col price_2_people numeric
add_col price_3_people numeric
add_col price_4_people numeric
add_col price_5_people numeric
add_col price_6_people numeric

add_array_col() {
  local table=$1
  local col=$2
  local typ=$3
  if ! sqlite3 "$DB" "SELECT 1 FROM pragma_table_info('$table') WHERE name='$col';" | grep -q 1; then
    sqlite3 "$DB" "ALTER TABLE $table ADD COLUMN $col $typ;"
    echo "Added column: $table.$col"
  fi
}

add_array_col routes_whats_included item_zh text
add_array_col routes_whats_included item_en text
add_array_col routes_day_itinerary description_zh text
add_array_col routes_day_itinerary description_en text

create_table_if_missing() {
  local table=$1
  local sql=$2
  if ! sqlite3 "$DB" "SELECT 1 FROM sqlite_master WHERE type='table' AND name='$table';" | grep -q 1; then
    sqlite3 "$DB" "$sql"
    echo "Created table: $table"
  fi
}

create_index_if_missing() {
  local index_name=$1
  local sql=$2
  if ! sqlite3 "$DB" "SELECT 1 FROM sqlite_master WHERE type='index' AND name='$index_name';" | grep -q 1; then
    sqlite3 "$DB" "$sql"
    echo "Created index: $index_name"
  fi
}

create_table_if_missing "routes_day_itinerary_text_blocks" "
CREATE TABLE routes_day_itinerary_text_blocks (
  _order integer NOT NULL,
  _parent_id text NOT NULL,
  id text PRIMARY KEY NOT NULL,
  description_zh text,
  description_en text,
  FOREIGN KEY (_parent_id) REFERENCES routes_day_itinerary(id) ON UPDATE no action ON DELETE cascade
);"
create_index_if_missing "routes_day_itinerary_text_blocks_order_idx" \
  "CREATE INDEX routes_day_itinerary_text_blocks_order_idx ON routes_day_itinerary_text_blocks (_order);"
create_index_if_missing "routes_day_itinerary_text_blocks_parent_id_idx" \
  "CREATE INDEX routes_day_itinerary_text_blocks_parent_id_idx ON routes_day_itinerary_text_blocks (_parent_id);"

# 若旧的 localized 描述表仍存在，先回填到 description_zh / description_en
if sqlite3 "$DB" "SELECT 1 FROM sqlite_master WHERE type='table' AND name='routes_day_itinerary_locales';" | grep -q 1; then
  sqlite3 "$DB" <<'SQL'
UPDATE routes_day_itinerary
SET description_zh = (
  SELECT l.description
  FROM routes_day_itinerary_locales l
  WHERE l._parent_id = routes_day_itinerary.id
    AND l._locale = 'zh'
    AND l.description IS NOT NULL
    AND trim(l.description) <> ''
  LIMIT 1
)
WHERE (description_zh IS NULL OR trim(description_zh) = '')
  AND EXISTS (
    SELECT 1
    FROM routes_day_itinerary_locales l
    WHERE l._parent_id = routes_day_itinerary.id
      AND l._locale = 'zh'
      AND l.description IS NOT NULL
      AND trim(l.description) <> ''
  );

UPDATE routes_day_itinerary
SET description_en = (
  SELECT l.description
  FROM routes_day_itinerary_locales l
  WHERE l._parent_id = routes_day_itinerary.id
    AND l._locale = 'en'
    AND l.description IS NOT NULL
    AND trim(l.description) <> ''
  LIMIT 1
)
WHERE (description_en IS NULL OR trim(description_en) = '')
  AND EXISTS (
    SELECT 1
    FROM routes_day_itinerary_locales l
    WHERE l._parent_id = routes_day_itinerary.id
      AND l._locale = 'en'
      AND l.description IS NOT NULL
      AND trim(l.description) <> ''
  );
SQL
fi

# 将旧的单段描述回填为第一条 text block，仅补空，不覆盖人工编辑内容
sqlite3 "$DB" <<'SQL'
INSERT INTO routes_day_itinerary_text_blocks (_order, _parent_id, id, description_zh, description_en)
SELECT
  0,
  d.id,
  lower(hex(randomblob(16))),
  d.description_zh,
  d.description_en
FROM routes_day_itinerary d
WHERE (coalesce(trim(d.description_zh), '') <> '' OR coalesce(trim(d.description_en), '') <> '')
  AND NOT EXISTS (
    SELECT 1
    FROM routes_day_itinerary_text_blocks b
    WHERE b._parent_id = d.id
  );
SQL

# 迁移旧数据到新列（若表仍有 base_price_per_person_per_day）
if sqlite3 "$DB" "SELECT 1 FROM pragma_table_info('routes') WHERE name='base_price_per_person_per_day';" | grep -q 1; then
  sqlite3 "$DB" "UPDATE routes SET
    price_2_people = COALESCE(price_2_people, CAST(base_price_per_person_per_day * days_count * 2 * 0.9 AS INTEGER)),
    price_3_people = COALESCE(price_3_people, CAST(base_price_per_person_per_day * days_count * 3 * 0.85 AS INTEGER)),
    price_4_people = COALESCE(price_4_people, CAST(base_price_per_person_per_day * days_count * 4 * 0.8 AS INTEGER)),
    price_5_people = COALESCE(price_5_people, CAST(base_price_per_person_per_day * days_count * 5 * 0.75 AS INTEGER)),
    price_6_people = COALESCE(price_6_people, CAST(base_price_per_person_per_day * days_count * 6 * 0.75 AS INTEGER))
  WHERE base_price_per_person_per_day IS NOT NULL AND price_2_people IS NULL;"
fi
