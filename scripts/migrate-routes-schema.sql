-- 路线表结构迁移：basePricePerPersonPerDay + maxPeople -> price_2~6_people + overview
-- 运行: sqlite3 payload.db < scripts/migrate-routes-schema.sql
-- 执行前请备份 payload.db

-- 1. 添加新列
ALTER TABLE routes ADD COLUMN overview_zh text;
ALTER TABLE routes ADD COLUMN overview_en text;
ALTER TABLE routes ADD COLUMN price_2_people numeric;
ALTER TABLE routes ADD COLUMN price_3_people numeric;
ALTER TABLE routes ADD COLUMN price_4_people numeric;
ALTER TABLE routes ADD COLUMN price_5_people numeric;
ALTER TABLE routes ADD COLUMN price_6_people numeric;

-- 2. 从旧列迁移数据（示例：2人价 = base * days * 2 * 0.9）
UPDATE routes SET
  price_2_people = CAST(base_price_per_person_per_day * days_count * 2 * 0.9 AS INTEGER),
  price_3_people = CAST(base_price_per_person_per_day * days_count * 3 * 0.85 AS INTEGER),
  price_4_people = CAST(base_price_per_person_per_day * days_count * 4 * 0.8 AS INTEGER),
  price_5_people = CAST(base_price_per_person_per_day * days_count * 5 * 0.75 AS INTEGER),
  price_6_people = CAST(base_price_per_person_per_day * days_count * 6 * 0.75 AS INTEGER)
WHERE base_price_per_person_per_day IS NOT NULL;

-- 3. 删除旧列（SQLite 3.35+）
-- ALTER TABLE routes DROP COLUMN base_price_per_person_per_day;
-- ALTER TABLE routes DROP COLUMN max_people;
