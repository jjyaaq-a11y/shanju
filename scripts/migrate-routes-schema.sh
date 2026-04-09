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
