# 山居 Shanju · 川西精品小团包车游

高端川西旅游品牌官网首页，基于 Next.js 15 App Router + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion + Lenis 平滑滚动。

## 环境要求

- **Node.js** 18+（建议 20 LTS）
- npm / pnpm / yarn

## 安装与运行

```bash
# 安装依赖
npm install

# 开发
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

## 项目结构

```
src/
├── app/
│   ├── layout.tsx      # 根布局、字体、LenisProvider
│   ├── page.tsx        # 首页
│   └── globals.css     # 全局样式、品牌色变量
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx  # 透明浮动导航
│   │   └── Footer.tsx  # 页脚、联系方式、二维码占位
│   ├── home/
│   │   ├── Hero.tsx           # 全屏 Hero
│   │   ├── SectionRoutes.tsx  # 精选路线
│   │   ├── SectionWhy.tsx     # 为什么山居
│   │   ├── SectionJournal.tsx # 最新手记
│   │   └── SectionAbout.tsx   # 关于我们
│   ├── providers/
│   │   └── LenisProvider.tsx  # Lenis 平滑滚动
│   └── ui/                    # shadcn 组件
│       ├── button.tsx
│       ├── card.tsx
│       └── badge.tsx
└── lib/
    └── utils.ts         # cn() 等工具
```

## 品牌色

| 名称   | 色值      | 用途       |
|--------|-----------|------------|
| 岩灰   | `#5F5A54` | 辅助、边框 |
| 高原蓝 | `#2A4B7C` | 主色、按钮 |
| 金麦黄 | `#D4A373` | 强调、Badge |
| 墨色   | `#1A1A1A` | 正文       |
| 米白   | `#F8F5F0` | 背景       |

## 构建与部署

```bash
npm run build
npm run start
```
