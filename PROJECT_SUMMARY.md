# 山居 Shanju 项目雏形总结

> 供后续 AI 或设计师对项目进行细化时参考：技术选型、代码模块、数据流与待完善项。

---

## 一、项目定位

- **产品**：高端川西旅游品牌「山居 Shanju」官网首页
- **调性**：精品小团包车游，高端、隐逸、自然、沉稳
- **当前范围**：单页首页（含导航、Hero、精选路线、为什么山居、最新手记、关于我们、页脚），中英双语切换

---

## 二、技术选型

| 类别 | 技术 | 版本/说明 |
|------|------|-----------|
| 框架 | Next.js | 15，App Router |
| 语言 | TypeScript | 5.x |
| 样式 | Tailwind CSS | 3.4，含 `tailwindcss-animate` |
| UI 组件库 | shadcn/ui | new-york 风格，RSC + TSX，CVA + Radix Slot |
| 动效 | Framer Motion | 11.x，入场动画、hover、stagger |
| 滚动 | Lenis | 1.x，整页平滑滚动 |
| 字体 | next/font | Noto Serif SC（标题）、Noto Sans SC（正文） |
| 图片 | next/image | 外链 Unsplash，当前使用 `unoptimized` 直连 |

**包管理**：npm，脚本：`dev` / `build` / `start` / `lint`。

---

## 三、目录与模块结构

```
shanju/
├── src/
│   ├── app/                      # App Router
│   │   ├── layout.tsx            # 根布局：字体、LocaleProvider、LenisProvider
│   │   ├── page.tsx              # 首页：拼装各 Section
│   │   └── globals.css            # 全局样式、CSS 变量（品牌色等）
│   │
│   ├── components/
│   │   ├── layout/                # 布局组件
│   │   │   ├── Navbar.tsx         # 顶栏：Logo、导航、中/EN 切换、移动端菜单
│   │   │   └── Footer.tsx         # 页脚：简介、链接、联系方式、微信占位、版权
│   │   ├── home/                 # 首页区块（Section）
│   │   │   ├── Hero.tsx           # 全屏背景图 + 主标题 + 副标题 + 双 CTA
│   │   │   ├── SectionRoutes.tsx  # 精选路线：4 张卡片网格，hover 放大+遮罩
│   │   │   ├── SectionWhy.tsx     # 为什么山居：4 列图标+文案
│   │   │   ├── SectionJournal.tsx # 最新手记：3 列文章卡片
│   │   │   └── SectionAbout.tsx   # 关于我们：单段文案
│   │   ├── ui/                    # shadcn 基础组件
│   │   │   ├── button.tsx         # Button（含 variant: default/outline/wheat 等）
│   │   │   ├── card.tsx           # Card / CardHeader / CardContent / CardFooter
│   │   │   └── badge.tsx          # Badge
│   │   └── providers/
│   │       └── LenisProvider.tsx  # 客户端挂载 Lenis 平滑滚动
│   │
│   ├── contexts/
│   │   └── LocaleContext.tsx      # 语言状态：zh/en，localStorage 持久化，t 文案
│   │
│   ├── locales/
│   │   ├── zh.ts                  # 中文文案（nav/hero/routes/why/journal/about/footer）
│   │   └── en.ts                  # 英文文案，与 zh 同结构（LocaleMessages 类型）
│   │
│   └── lib/
│       ├── utils.ts               # cn()（clsx + tailwind-merge）
│       └── images.ts              # 外链图片 URL：hero、路线 4 张、手记 3 张
│
├── components.json                # shadcn 配置（style/new-york, tailwind, aliases）
├── tailwind.config.ts             # 品牌色、字体变量、animate
├── next.config.ts                 # images.remotePatterns（Unsplash）
├── tsconfig.json                  # paths: @/* -> ./src/*
├── postcss.config.mjs
├── package.json
└── README.md
```

---

## 四、核心功能与数据流

### 4.1 页面结构（自上而下）

1. **Navbar**：固定顶栏，Logo「山居 Shanju」，导航（首页/精选路线/山居手记/关于我们/联系咨询），右侧「中文 | EN」切换；移动端折叠菜单 + 同语言切换。
2. **Hero**：全屏图 + 主标题/副标题 + 两个 CTA（精选路线、联系咨询）。
3. **SectionRoutes**：4 张路线卡片（稻城亚丁、色达、四姑娘山、九寨黄龙），图片 + 标题 + 天数 + 描述，hover 时放大与遮罩文案。
4. **SectionWhy**：4 列（小团限额、当地向导、精选住宿、安全保障），图标 + 标题 + 描述。
5. **SectionJournal**：3 张手记卡片，图 + 标签 + 日期 + 标题 + 摘要 +「阅读全文」。
6. **SectionAbout**：单标题 + 一段品牌介绍。
7. **Footer**：品牌名、简介、导航链接、联系咨询、微信 ID、二维码占位、版权与 ICP 占位。

### 4.2 国际化（i18n）

- **实现方式**：React Context（`LocaleContext`），无路由分段；语言存在 `localStorage`（key: `shanju-locale`），可选 `zh` | `en`。
- **文案来源**：`useLocale()` 返回 `{ locale, setLocale, t }`，`t` 与 `zh`/`en` 结构一致（`LocaleMessages`），覆盖 nav、hero、routes、why、journal、about、footer。
- **注意**：`html lang` 在客户端根据 `locale` 设为 `zh-CN` 或 `en`。

### 4.3 图片

- **来源**：`src/lib/images.ts` 中写死 Unsplash URL；Hero、路线、手记均引用该文件。
- **使用方式**：`next/image` + `unoptimized`，直接请求 Unsplash，不经过 `_next/image` 代理。
- **可扩展**：后续可改为 CMS/静态 JSON 配置，或按环境切换图源。

### 4.4 动效与滚动

- **Framer Motion**：各 Section 使用 `initial` / `animate` / `whileInView`，列表使用 `staggerChildren`；Navbar 有简单入场与移动端展开/收起。
- **Lenis**：在 `layout` 内通过 `LenisProvider` 挂载，作用于整页平滑滚动。

---

## 五、配置与主题

### 5.1 品牌色（Tailwind + CSS 变量）

- **rock**：`#5F5A54`（岩灰）
- **plateau**：`#2A4B7C`（高原蓝，主色）
- **wheat**：`#D4A373`（金麦黄）
- **ink**：`#1A1A1A`（正文）
- **cream**：`#F8F5F0`（背景）

在 `globals.css` 中另有 `--background`、`--foreground`、`--primary` 等变量，与 shadcn 主题一致。

### 5.2 字体

- `--font-serif`：Noto Serif SC（标题）
- `--font-sans`：Noto Sans SC（正文）
- `tailwind.config` 中 `fontFamily.serif` / `fontFamily.sans` 引用上述变量。

### 5.3 shadcn

- `components.json`：new-york、RSC、TSX、baseColor stone、CSS 变量、`@/components`、`@/lib/utils`。
- 仅使用 Button、Card、Badge；其余组件可按需用 CLI 添加。

---

## 六、占位与待细化项

| 项 | 当前状态 | 建议后续处理 |
|----|----------|--------------|
| 导航链接 | 首页为 `/`，其余为 `#routes` 等锚点 | 可改为 `/routes`、`/journal` 等独立页或保留单页锚点 |
| 手记「更多」「阅读全文」 | `href="#"` | 接真实手记列表页、详情页或 CMS |
| 微信二维码 | 灰色块 + 文案「二维码占位」 | 替换为真实二维码图或组件 |
| 版权 / ICP | 固定文案「蜀ICP备xxxxxxxx号」 | 替换为真实备案号与版权声明 |
| 路线/手记内容 | 全部来自 `locales/zh.ts`、`en.ts` | 可迁至 CMS 或 MDX，按 locale 拉取 |
| 图片 | 全部来自 `lib/images.ts` 的 Unsplash | 可改为 CDN/CMS/本地静态资源，并考虑取消 `unoptimized` 做优化 |
| SEO / metadata | `layout.tsx` 中写死中文 title/description | 按 locale 或路由生成多语言 meta |
| 无障碍 | 基础 aria-label | 可做完整 a11y 审计与改进 |

---

## 七、建议后续设计细化方向

1. **信息架构**：是否增加「精选路线」「山居手记」「关于我们」独立页；是否增加预订/咨询表单页。
2. **内容来源**：路线、手记、关于我们等是否接入 CMS（如 Strapi、Contentful）或 MDX，以及多语言内容策略。
3. **视觉规范**：在现有品牌色与字体基础上，细化组件样式（间距、圆角、阴影、响应式断点）、Banner/卡片规范、空状态与错误态。
4. **交互规范**：按钮/链接 hover/焦点态、移动端手势、加载态、表单校验与错误提示。
5. **性能与 SEO**：图片优化策略（是否保留 unoptimized、是否上 CDN）、多语言 meta、sitemap、结构化数据。
6. **扩展技术**：若需表单与校验可考虑 React Hook Form + Zod；若需更完整 i18n 可评估 next-intl 与路由分段（如 `/en/`、`/zh/`）。

---

## 八、快速上手（给后续 AI）

- 安装：`npm install`  
- 开发：`npm run dev` → http://localhost:3000  
- 文案：改 `src/locales/zh.ts`、`en.ts`  
- 图片：改 `src/lib/images.ts`  
- 品牌色/字体：`tailwind.config.ts` + `src/app/globals.css`  
- 新增 Section：在 `src/components/home/` 加组件，在 `src/app/page.tsx` 中引入并放入 `<main>`。

以上即为当前项目雏形的完整总结，可直接作为「项目设计细化」的输入文档使用。
