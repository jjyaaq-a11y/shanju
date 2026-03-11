-- 初始化路线种子数据
-- 先运行 npm run dev 让 Payload 创建表，再运行: npm run seed:routes

DELETE FROM routes_day_itinerary_locales WHERE _parent_id IN ('di-dyc-1','di-dyc-2','di-dyc-3','di-dyc-4','di-dyc-5','di-cd-1','di-cd-2','di-cd-3');
DELETE FROM routes_day_itinerary WHERE id IN ('di-dyc-1','di-dyc-2','di-dyc-3','di-dyc-4','di-dyc-5','di-cd-1','di-cd-2','di-cd-3');
DELETE FROM routes WHERE slug IN ('daocheng-yading', 'chengdu-zoo-dujiangyan-sanxingdui');

-- 稻城亚丁 · 5天 (每人: 2人$1260, 3人$1190, 4人$1120, 5人$1050, 6人$1050)
INSERT INTO routes (name, slug, days_count, overview_zh, overview_en, price_2_people, price_3_people, price_4_people, price_5_people, price_6_people)
VALUES (
  '稻城亚丁 · 最后的香格里拉',
  'daocheng-yading',
  5,
  '稻城亚丁，被誉为「最后的香格里拉」。雪山、海子、牧场，秘境徒步与高原风光。专车私团，2–6人成行。',
  'Daocheng Yading, known as the Last Shangri-La. Snow peaks, alpine lakes, pastures. Private vehicle, 2–6 guests.',
  1260, 1190, 1120, 1050, 1050
);

-- 当天图片仅通过后台「当天图片（上传）」管理，不再使用 URL 字段
INSERT INTO routes_day_itinerary (_order, _parent_id, id) VALUES
(0, (SELECT id FROM routes WHERE slug='daocheng-yading'), 'di-dyc-1'),
(1, (SELECT id FROM routes WHERE slug='daocheng-yading'), 'di-dyc-2'),
(2, (SELECT id FROM routes WHERE slug='daocheng-yading'), 'di-dyc-3'),
(3, (SELECT id FROM routes WHERE slug='daocheng-yading'), 'di-dyc-4'),
(4, (SELECT id FROM routes WHERE slug='daocheng-yading'), 'di-dyc-5');

INSERT INTO routes_day_itinerary_locales (description, _locale, _parent_id) VALUES
('{"root":{"children":[{"children":[{"detail":0,"format":"","mode":"normal","style":"","text":"成都出发，经雅康高速抵达康定，翻折多山至新都桥。沿途高山峡谷，傍晚新都桥自由活动，适应海拔。","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}','zh','di-dyc-1'),
('{"root":{"children":[{"children":[{"detail":0,"format":"","mode":"normal","style":"","text":"Depart Chengdu via Yaan-Kangding highway to Kangding, cross Zheduo Pass to Xinduqiao. Mountain valleys, free time in Xinduqiao for acclimatization.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}','en','di-dyc-1'),
('{"root":{"children":[{"children":[{"detail":0,"format":"","mode":"normal","style":"","text":"新都桥出发，经高尔寺山、卡子拉山至理塘，午餐后前往稻城。途经海子山古冰帽，傍晚入住稻城。","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}','zh','di-dyc-2'),
('{"root":{"children":[{"children":[{"detail":0,"format":"","mode":"normal","style":"","text":"Xinduqiao to Litang via Gaersi and Kazila passes, then to Daocheng. Drive past Haizi Mountain ancient ice cap, overnight in Daocheng.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}','en','di-dyc-2'),
('{"root":{"children":[{"children":[{"detail":0,"format":"","mode":"normal","style":"","text":"稻城前往亚丁景区。乘观光车至扎灌崩，徒步至冲古寺、珍珠海。雪山倒影、秋色层林，秘境初探。","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}','zh','di-dyc-3'),
('{"root":{"children":[{"children":[{"detail":0,"format":"","mode":"normal","style":"","text":"Daocheng to Yading. Shuttle to Zhaguanbeng, hike to Chonggu Temple and Pearl Lake. Snow peaks, autumn colors, first taste of the sacred valley.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}','en','di-dyc-3'),
('{"root":{"children":[{"children":[{"detail":0,"format":"","mode":"normal","style":"","text":"亚丁深度日。乘电瓶车至洛绒牛场，徒步五色海、牛奶海（视体能）。雪山、海子、牧场，高原精华。","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}','zh','di-dyc-4'),
('{"root":{"children":[{"children":[{"detail":0,"format":"","mode":"normal","style":"","text":"Full day in Yading. Electric cart to Luorong Pasture, hike to Five-Color Lake and Milk Lake (subject to fitness). Snow peaks, alpine lakes, grasslands.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}','en','di-dyc-4'),
('{"root":{"children":[{"children":[{"detail":0,"format":"","mode":"normal","style":"","text":"稻城返程。经桑堆红草地（秋季）、理塘、新都桥，返回成都，结束行程。","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}','zh','di-dyc-5'),
('{"root":{"children":[{"children":[{"detail":0,"format":"","mode":"normal","style":"","text":"Return to Chengdu via Sangdui red grassland (autumn), Litang, Xinduqiao. End of journey.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}','en','di-dyc-5');

-- 成都动物园 · 都江堰 · 三星堆 · 3天 (每人: 2人$486, 3人$459, 4人$432, 5人$405, 6人$405)
INSERT INTO routes (name, slug, days_count, overview_zh, overview_en, price_2_people, price_3_people, price_4_people, price_5_people, price_6_people)
VALUES (
  '成都动物园 · 都江堰 · 三星堆',
  'chengdu-zoo-dujiangyan-sanxingdui',
  3,
  '成都周边经典人文路线。大熊猫基地、世界遗产都江堰、古蜀文明三星堆，适合亲子与文化探索。',
  'Classic Chengdu culture route. Giant pandas, Dujiangyan UNESCO site, Sanxingdui ancient Shu civilization. Family-friendly.',
  486, 459, 432, 405, 405
);

INSERT INTO routes_day_itinerary (_order, _parent_id, id) VALUES
(0, (SELECT id FROM routes WHERE slug='chengdu-zoo-dujiangyan-sanxingdui'), 'di-cd-1'),
(1, (SELECT id FROM routes WHERE slug='chengdu-zoo-dujiangyan-sanxingdui'), 'di-cd-2'),
(2, (SELECT id FROM routes WHERE slug='chengdu-zoo-dujiangyan-sanxingdui'), 'di-cd-3');

INSERT INTO routes_day_itinerary_locales (description, _locale, _parent_id) VALUES
('{"root":{"children":[{"children":[{"detail":0,"format":"","mode":"normal","style":"","text":"成都动物园。大熊猫、金丝猴等本土物种，适合亲子。下午自由活动，可逛宽窄巷子或锦里。","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}','zh','di-cd-1'),
('{"root":{"children":[{"children":[{"detail":0,"format":"","mode":"normal","style":"","text":"Chengdu Zoo. Giant pandas, golden snub-nosed monkeys. Family-friendly. Afternoon free—Kuanzhai Alleys or Jinli.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}','en','di-cd-1'),
('{"root":{"children":[{"children":[{"detail":0,"format":"","mode":"normal","style":"","text":"都江堰。世界文化遗产，两千多年水利工程。游览鱼嘴、飞沙堰、宝瓶口。","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}','zh','di-cd-2'),
('{"root":{"children":[{"children":[{"detail":0,"format":"","mode":"normal","style":"","text":"Dujiangyan. UNESCO World Heritage, 2,000-year irrigation system. Yuzui, Feishayan, Baopingkou.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}','en','di-cd-2'),
('{"root":{"children":[{"children":[{"detail":0,"format":"","mode":"normal","style":"","text":"三星堆博物馆。古蜀文明，青铜神树、黄金面具等珍品。下午返程成都。","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}','zh','di-cd-3'),
('{"root":{"children":[{"children":[{"detail":0,"format":"","mode":"normal","style":"","text":"Sanxingdui Museum. Ancient Shu civilization: bronze sacred tree, gold masks. Return to Chengdu.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}','en','di-cd-3');
