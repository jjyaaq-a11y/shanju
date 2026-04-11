#!/usr/bin/env bash
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

for col in \
  hero_title_zh hero_title_en \
  hero_tagline_zh hero_tagline_en \
  hero_region_sub_zh hero_region_sub_en \
  hero_subtitle_zh hero_subtitle_en \
  hero_cta_routes_zh hero_cta_routes_en \
  hero_cta_contact_zh hero_cta_contact_en \
  hero_alt_image_zh hero_alt_image_en \
  why_section_title_zh why_section_title_en \
  why_section_desc_zh why_section_desc_en \
  why_payment_title_zh why_payment_title_en \
  why_payment_desc_zh why_payment_desc_en \
  why_translation_title_zh why_translation_title_en \
  why_translation_desc_zh why_translation_desc_en \
  journal_section_title_zh journal_section_title_en \
  journal_section_desc_zh journal_section_desc_en \
  about_title_zh about_title_en \
  about_body_zh about_body_en \
  footer_desc_zh footer_desc_en \
  footer_copyright_zh footer_copyright_en
  do
  add_col site_settings "$col" text
 done

for col in title_zh title_en desc_zh desc_en; do
  add_col site_settings_why_items "$col" text
done

create_table_if_missing "site_settings_hero_images" "
CREATE TABLE site_settings_hero_images (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id text PRIMARY KEY NOT NULL,
  image_id integer,
  FOREIGN KEY (image_id) REFERENCES media(id) ON UPDATE no action ON DELETE set null,
  FOREIGN KEY (_parent_id) REFERENCES site_settings(id) ON UPDATE no action ON DELETE cascade
);"
create_index_if_missing "site_settings_hero_images_order_idx" \
  "CREATE INDEX site_settings_hero_images_order_idx ON site_settings_hero_images (_order);"
create_index_if_missing "site_settings_hero_images_parent_id_idx" \
  "CREATE INDEX site_settings_hero_images_parent_id_idx ON site_settings_hero_images (_parent_id);"
create_index_if_missing "site_settings_hero_images_image_idx" \
  "CREATE INDEX site_settings_hero_images_image_idx ON site_settings_hero_images (image_id);"

if sqlite3 "$DB" "SELECT 1 FROM sqlite_master WHERE type='table' AND name='site_settings_locales';" | grep -q 1; then
  while IFS='|' read -r new_col old_col; do
    sqlite3 "$DB" <<SQL
UPDATE site_settings
SET $new_col = (
  SELECT l.$old_col
  FROM site_settings_locales l
  WHERE l._parent_id = site_settings.id
    AND l._locale = 'zh'
    AND l.$old_col IS NOT NULL
    AND trim(l.$old_col) <> ''
  LIMIT 1
)
WHERE '$new_col' LIKE '%_zh'
  AND ($new_col IS NULL OR trim($new_col) = '')
  AND EXISTS (
    SELECT 1
    FROM site_settings_locales l
    WHERE l._parent_id = site_settings.id
      AND l._locale = 'zh'
      AND l.$old_col IS NOT NULL
      AND trim(l.$old_col) <> ''
  );
SQL

    sqlite3 "$DB" <<SQL
UPDATE site_settings
SET ${new_col%_zh}_en = (
  SELECT l.$old_col
  FROM site_settings_locales l
  WHERE l._parent_id = site_settings.id
    AND l._locale = 'en'
    AND l.$old_col IS NOT NULL
    AND trim(l.$old_col) <> ''
  LIMIT 1
)
WHERE (${new_col%_zh}_en IS NULL OR trim(${new_col%_zh}_en) = '')
  AND EXISTS (
    SELECT 1
    FROM site_settings_locales l
    WHERE l._parent_id = site_settings.id
      AND l._locale = 'en'
      AND l.$old_col IS NOT NULL
      AND trim(l.$old_col) <> ''
  );
SQL
  done <<'MAP'
hero_title_zh|hero_title
hero_tagline_zh|hero_tagline
hero_region_sub_zh|hero_region_sub
hero_subtitle_zh|hero_subtitle
hero_cta_routes_zh|hero_cta_routes
hero_cta_contact_zh|hero_cta_contact
hero_alt_image_zh|hero_alt_image
why_section_title_zh|why_section_title
why_section_desc_zh|why_section_desc
why_payment_title_zh|why_payment_title
why_payment_desc_zh|why_payment_desc
why_translation_title_zh|why_translation_title
why_translation_desc_zh|why_translation_desc
journal_section_title_zh|journal_section_title
journal_section_desc_zh|journal_section_desc
about_title_zh|about_title
about_body_zh|about_body
footer_desc_zh|footer_desc
footer_copyright_zh|footer_copyright
MAP
fi

if sqlite3 "$DB" "SELECT 1 FROM sqlite_master WHERE type='table' AND name='site_settings_why_items_locales';" | grep -q 1; then
  sqlite3 "$DB" <<'SQL'
UPDATE site_settings_why_items
SET title_zh = (
  SELECT l.title
  FROM site_settings_why_items_locales l
  WHERE l._parent_id = site_settings_why_items.id
    AND l._locale = 'zh'
    AND l.title IS NOT NULL
    AND trim(l.title) <> ''
  LIMIT 1
)
WHERE (title_zh IS NULL OR trim(title_zh) = '')
  AND EXISTS (
    SELECT 1
    FROM site_settings_why_items_locales l
    WHERE l._parent_id = site_settings_why_items.id
      AND l._locale = 'zh'
      AND l.title IS NOT NULL
      AND trim(l.title) <> ''
  );

UPDATE site_settings_why_items
SET title_en = (
  SELECT l.title
  FROM site_settings_why_items_locales l
  WHERE l._parent_id = site_settings_why_items.id
    AND l._locale = 'en'
    AND l.title IS NOT NULL
    AND trim(l.title) <> ''
  LIMIT 1
)
WHERE (title_en IS NULL OR trim(title_en) = '')
  AND EXISTS (
    SELECT 1
    FROM site_settings_why_items_locales l
    WHERE l._parent_id = site_settings_why_items.id
      AND l._locale = 'en'
      AND l.title IS NOT NULL
      AND trim(l.title) <> ''
  );

UPDATE site_settings_why_items
SET desc_zh = (
  SELECT l.desc
  FROM site_settings_why_items_locales l
  WHERE l._parent_id = site_settings_why_items.id
    AND l._locale = 'zh'
    AND l.desc IS NOT NULL
    AND trim(l.desc) <> ''
  LIMIT 1
)
WHERE (desc_zh IS NULL OR trim(desc_zh) = '')
  AND EXISTS (
    SELECT 1
    FROM site_settings_why_items_locales l
    WHERE l._parent_id = site_settings_why_items.id
      AND l._locale = 'zh'
      AND l.desc IS NOT NULL
      AND trim(l.desc) <> ''
  );

UPDATE site_settings_why_items
SET desc_en = (
  SELECT l.desc
  FROM site_settings_why_items_locales l
  WHERE l._parent_id = site_settings_why_items.id
    AND l._locale = 'en'
    AND l.desc IS NOT NULL
    AND trim(l.desc) <> ''
  LIMIT 1
)
WHERE (desc_en IS NULL OR trim(desc_en) = '')
  AND EXISTS (
    SELECT 1
    FROM site_settings_why_items_locales l
    WHERE l._parent_id = site_settings_why_items.id
      AND l._locale = 'en'
      AND l.desc IS NOT NULL
      AND trim(l.desc) <> ''
  );
SQL
fi

sqlite3 "$DB" <<'SQL'
INSERT INTO site_settings_hero_images (_order, _parent_id, id, image_id)
SELECT
  0,
  s.id,
  lower(hex(randomblob(16))),
  s.hero_hero_image_id
FROM site_settings s
WHERE s.hero_hero_image_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM site_settings_hero_images hi
    WHERE hi._parent_id = s.id
  );
SQL

echo "site-settings schema migration complete"
