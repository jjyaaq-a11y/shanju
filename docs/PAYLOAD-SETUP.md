# Payload CMS 后台管理端 · 安装与使用

## 安装命令

```bash
# 若遇到 Next.js 版本 peer 冲突，使用 --legacy-peer-deps
npm install payload@^3 @payloadcms/next@^3 @payloadcms/db-sqlite@^3 @payloadcms/richtext-lexical@^3 sharp@^0.33 --legacy-peer-deps
```

## 环境变量

复制 `.env.example` 为 `.env`，并设置：

```
PAYLOAD_SECRET=your-secret-key-at-least-32-characters
DATABASE_URL=file:./payload.db
```

## 生成 ImportMap

首次安装后或新增 collections 后运行：

```bash
npm run payload:generate:importmap
```

（使用临时 slate 配置以绕过 lexical 的 top-level await；生成的 importMap 与主配置兼容。）

## 启动

```bash
npm run dev
```

访问 **http://localhost:3000/admin**，首次进入会提示创建管理员账号（邮箱需符合格式，如 `admin@example.com`，密码自设）。

## 路由说明

| 路径 | 说明 |
|------|------|
| /admin | 后台管理面板（路线、附加项、用户） |
| /api | REST API |
| /graphql | GraphQL API |
| /graphql-playground | GraphQL 调试 |

## 集合 (Collections)

- **Users**：管理员账号（默认 auth）
- **Media**：媒体库（upload + 图像优化 thumbnail/card/tablet）
- **Routes**：路线（name、slug、daysCount、overviewZh/overviewEn、price_2_people～price_6_people、dayItinerary）。dayItinerary 为按天数组：每天 0–2 张图片 + 当天描述（中英文），条目数由 daysCount 决定。
- **Addons**：附加项（可选，详情页已取消定制项）

## 多语言 (Localization)

- locales: zh, en
- defaultLocale: zh
- Routes.description 支持 localized: true

## 权限 (Access Control)

- Media、Routes、Addons 仅登录管理员可读写

## 生成类型

```bash
npm run payload:generate:types
```

## 路线迁移与种子（可选）

若从旧 schema 升级，先运行迁移：

```bash
npm run migrate:routes
```

初始化两条示例路线：

```bash
npm run seed:routes
```

即执行 `scripts/seed-routes.sql`。需先运行 `migrate:routes` 添加新列，种子脚本为幂等（重复运行会先删除再插入）。

## 生产环境

- SQLite 适合本地/小流量；生产建议使用 PostgreSQL。
- 安装 `@payloadcms/db-postgres`，在 `payload.config.ts` 中改用 `postgresAdapter`。
- 若使用 standalone 部署，SQLite 的 libsql 在部分环境可能需额外配置。
