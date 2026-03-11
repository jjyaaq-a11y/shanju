# 主页 Hero 字体与文案代码位置

需要调整 **「Shanju / Your chance to explore Shangri-La / Western Sichuan」** 这一块的字体与排版时，改下面几处即可。

---

## 1. 文案内容（中英文）

**文件：** `src/locales/zh.ts`、`src/locales/en.ts`

- `hero.title` → 主标题（如 "山居" / "Shanju"）
- `hero.tagline` → 主标语（如 "探索香格里拉的机会" / "Your chance to explore Shangri-La"）
- `hero.regionSub` → 小字（如 "川西" / "Western Sichuan"）

---

## 2. Hero 区块的字体与样式（标题 + 主标语 + 小字）

**文件：** `src/components/home/Hero.tsx`

当前结构：

| 文案 | 元素 | 当前 className（行号） | 说明 |
|------|------|------------------------|------|
| 主标题 (Shanju) | `<motion.h1>` | `font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-cream drop-shadow-lg mb-3` (约 33 行) | 使用全局 serif，字重 semibold |
| 主标语 (Your chance to explore Shangri-La) | `<motion.p>` | `text-cream/95 text-lg sm:text-xl md:text-2xl font-light tracking-wide` (约 41 行) | 未指定 font-serif，继承 body 的 font-sans；字重 light |
| 小字 (Western Sichuan) | `<motion.p>` | `text-cream/80 text-sm sm:text-base mt-1 mb-10` (约 48 行) | 同样继承 font-sans，较小字号 |

要显得更「高端」可考虑：

- 主标题：保持或加强 `font-serif`，可试 `font-medium` / `font-normal`、字间距 `tracking-tight` 或 `tracking-widest`、或更大字号。
- 主标语：改为 `font-serif`（与标题统一）、或换字重（如 `font-normal`）、调整 `tracking-*`、`leading-*`。
- 小字：可改为 `font-serif`、`uppercase` + `tracking-widest`、或更细字重。

---

## 3. 全局字体定义（serif / sans 来源）

**文件：** `src/app/layout.tsx`（约 7–18 行）

- **Serif：** `Noto_Serif_SC`，CSS 变量 `--font-serif`，用于 `font-serif`。
- **Sans：** `Noto_Sans_SC`，CSS 变量 `--font-sans`，用于 `font-sans`；`<body>` 默认是 `font-sans`。

若要换更「高端」的字体，可在此处换别的 Google Font（或本地字体），并保证 Tailwind 里引用同一变量。

**文件：** `tailwind.config.ts`（约 19–22 行）

- `fontFamily.serif` → `var(--font-serif)` + fallback
- `fontFamily.sans` → `var(--font-sans)` + fallback

Hero 里用 `font-serif` 即用这里定义的 serif 字体。

---

## 4. 小结：只改 Hero 文案字体时

- **只改样式（字重、字号、间距、serif/sans）：** 改 `src/components/home/Hero.tsx` 里上述三处 `className`。
- **换字体（整站或仅 Hero）：** 改 `src/app/layout.tsx` 的 `Noto_Serif_SC` / `Noto_Sans_SC` 以及 `tailwind.config.ts` 的 `fontFamily`。

把这份说明给其他 AI，即可基于以上位置做「更高端」的字体与排版方案。
