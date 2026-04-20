# Axion EV Fleet Management — Color Palette Recommendation

## Problem with Current Palette

Your current theme has the classic "AI-generated dark dashboard" look:

| Issue | Current Value | Why it looks AI-generated |
|---|---|---|
| **Primary** | `#00E5FF` (pure cyan) | Overly saturated, "Tron-like", no warmth or personality |
| **Secondary** | `#6C63FF` (purple) | Generic AI purple — seen in every Claude/ChatGPT mockup |
| **Background** | `#0B0F14` (near-black) | Too dark, no depth variation, feels flat |
| **Accent pattern** | Cyan + Purple + Amber | The "AI trifecta" — screams auto-generated |
| **No light theme** | — | Real products ship both themes |

---

## Recommended Theme: **"Volt"**

A refined, automotive-inspired palette that feels premium, modern, and intentional — like Tesla/Rivian dashboards rather than a sci-fi movie.

---

## 🌑 Dark Theme — "Volt Dark"

### Backgrounds & Surfaces

| Token | Hex | Preview | Usage |
|---|---|---|---|
| `bg-base` | `#101216` | ![#101216](https://via.placeholder.com/20/101216/101216) | App background |
| `bg-surface` | `#181B22` | ![#181B22](https://via.placeholder.com/20/181B22/181B22) | Cards, panels |
| `bg-surface-raised` | `#1F2330` | ![#1F2330](https://via.placeholder.com/20/1F2330/1F2330) | Elevated cards, modals |
| `bg-surface-overlay` | `#262B3A` | ![#262B3A](https://via.placeholder.com/20/262B3A/262B3A) | Dropdowns, popovers |
| `bg-sidebar` | `#13161C` | ![#13161C](https://via.placeholder.com/20/13161C/13161C) | Sidebar navigation |

### Borders & Dividers

| Token | Hex | Preview | Usage |
|---|---|---|---|
| `border-default` | `#2A2F3E` | ![#2A2F3E](https://via.placeholder.com/20/2A2F3E/2A2F3E) | Card borders, dividers |
| `border-subtle` | `#1F2330` | ![#1F2330](https://via.placeholder.com/20/1F2330/1F2330) | Subtle separators |
| `border-focus` | `#4ECDC4` | ![#4ECDC4](https://via.placeholder.com/20/4ECDC4/4ECDC4) | Focus rings |

### Text

| Token | Hex | Preview | Usage |
|---|---|---|---|
| `text-primary` | `#E8ECF4` | ![#E8ECF4](https://via.placeholder.com/20/E8ECF4/E8ECF4) | Headings, primary text |
| `text-secondary` | `#8B93A7` | ![#8B93A7](https://via.placeholder.com/20/8B93A7/8B93A7) | Body text, descriptions |
| `text-tertiary` | `#5C6478` | ![#5C6478](https://via.placeholder.com/20/5C6478/5C6478) | Placeholders, captions |
| `text-inverse` | `#101216` | ![#101216](https://via.placeholder.com/20/101216/101216) | Text on primary buttons |

### Primary — Teal (replaces generic Cyan)

| Token | Hex | Preview | Usage |
|---|---|---|---|
| `primary-50` | `#EFFEFA` | ![#EFFEFA](https://via.placeholder.com/20/EFFEFA/EFFEFA) | Tinted backgrounds |
| `primary-100` | `#C7FBF1` | ![#C7FBF1](https://via.placeholder.com/20/C7FBF1/C7FBF1) | Light badges/tags |
| `primary-200` | `#90F7E4` | ![#90F7E4](https://via.placeholder.com/20/90F7E4/90F7E4) | Hover tints |
| `primary-400` | `#4ECDC4` | ![#4ECDC4](https://via.placeholder.com/20/4ECDC4/4ECDC4) | **Main primary — buttons, links, icons** |
| `primary-500` | `#38B2AC` | ![#38B2AC](https://via.placeholder.com/20/38B2AC/38B2AC) | Hover state on primary |
| `primary-600` | `#2C9A94` | ![#2C9A94](https://via.placeholder.com/20/2C9A94/2C9A94) | Active/pressed state |
| `primary-700` | `#1A7A74` | ![#1A7A74](https://via.placeholder.com/20/1A7A74/1A7A74) | Dark accents |
| `primary-glow` | `rgba(78, 205, 196, 0.15)` | — | Glow/shadow effects |

### Secondary — Slate Blue (replaces generic Purple)

| Token | Hex | Preview | Usage |
|---|---|---|---|
| `secondary-400` | `#7C8CF5` | ![#7C8CF5](https://via.placeholder.com/20/7C8CF5/7C8CF5) | **Secondary actions, highlights** |
| `secondary-500` | `#6366F1` | ![#6366F1](https://via.placeholder.com/20/6366F1/6366F1) | Hover state |
| `secondary-600` | `#4F46E5` | ![#4F46E5](https://via.placeholder.com/20/4F46E5/4F46E5) | Active state |
| `secondary-glow` | `rgba(124, 140, 245, 0.12)` | — | Glow effects |

### Accent — Warm Amber (for CTAs and highlights)

| Token | Hex | Preview | Usage |
|---|---|---|---|
| `accent-400` | `#FBBF24` | ![#FBBF24](https://via.placeholder.com/20/FBBF24/FBBF24) | Warnings, highlights |
| `accent-500` | `#F59E0B` | ![#F59E0B](https://via.placeholder.com/20/F59E0B/F59E0B) | Emphasis, badges |
| `accent-warm` | `#FB923C` | ![#FB923C](https://via.placeholder.com/20/FB923C/FB923C) | Warm CTA accents |

### Status / Semantic Colors

| Token | Hex | Preview | Usage |
|---|---|---|---|
| `success` | `#34D399` | ![#34D399](https://via.placeholder.com/20/34D399/34D399) | Healthy, online, charged |
| `success-muted` | `rgba(52, 211, 153, 0.12)` | — | Success badge backgrounds |
| `warning` | `#FBBF24` | ![#FBBF24](https://via.placeholder.com/20/FBBF24/FBBF24) | Low battery, caution |
| `warning-muted` | `rgba(251, 191, 36, 0.12)` | — | Warning badge backgrounds |
| `error` | `#F87171` | ![#F87171](https://via.placeholder.com/20/F87171/F87171) | Critical, offline, faults |
| `error-muted` | `rgba(248, 113, 113, 0.12)` | — | Error badge backgrounds |
| `info` | `#60A5FA` | ![#60A5FA](https://via.placeholder.com/20/60A5FA/60A5FA) | Informational, in-transit |
| `info-muted` | `rgba(96, 165, 250, 0.12)` | — | Info badge backgrounds |

### Chart / Data Visualization Colors

| Token | Hex | Preview | Usage |
|---|---|---|---|
| `chart-1` | `#4ECDC4` | ![#4ECDC4](https://via.placeholder.com/20/4ECDC4/4ECDC4) | Primary data series |
| `chart-2` | `#7C8CF5` | ![#7C8CF5](https://via.placeholder.com/20/7C8CF5/7C8CF5) | Secondary data series |
| `chart-3` | `#34D399` | ![#34D399](https://via.placeholder.com/20/34D399/34D399) | Tertiary data series |
| `chart-4` | `#FBBF24` | ![#FBBF24](https://via.placeholder.com/20/FBBF24/FBBF24) | Fourth data series |
| `chart-5` | `#F87171` | ![#F87171](https://via.placeholder.com/20/F87171/F87171) | Fifth data series |
| `chart-6` | `#A78BFA` | ![#A78BFA](https://via.placeholder.com/20/A78BFA/A78BFA) | Sixth data series |

### Glassmorphism Tokens (Dark)

| Token | Value | Usage |
|---|---|---|
| `glass-bg` | `rgba(24, 27, 34, 0.75)` | Glass panel background |
| `glass-border` | `rgba(78, 205, 196, 0.12)` | Glass border (subtle teal tint) |
| `glass-blur` | `backdrop-filter: blur(16px)` | Frosted effect |

---

## ☀️ Light Theme — "Volt Light"

### Backgrounds & Surfaces

| Token | Hex | Preview | Usage |
|---|---|---|---|
| `bg-base` | `#F7F8FB` | ![#F7F8FB](https://via.placeholder.com/20/F7F8FB/F7F8FB) | App background (warm off-white) |
| `bg-surface` | `#FFFFFF` | ![#FFFFFF](https://via.placeholder.com/20/FFFFFF/FFFFFF) | Cards, panels |
| `bg-surface-raised` | `#FFFFFF` | ![#FFFFFF](https://via.placeholder.com/20/FFFFFF/FFFFFF) | Elevated cards with shadow |
| `bg-surface-overlay` | `#FFFFFF` | ![#FFFFFF](https://via.placeholder.com/20/FFFFFF/FFFFFF) | Dropdowns, popovers |
| `bg-sidebar` | `#F0F1F6` | ![#F0F1F6](https://via.placeholder.com/20/F0F1F6/F0F1F6) | Sidebar navigation |
| `bg-muted` | `#EFF0F6` | ![#EFF0F6](https://via.placeholder.com/20/EFF0F6/EFF0F6) | Input fields, disabled areas |

### Borders & Dividers

| Token | Hex | Preview | Usage |
|---|---|---|---|
| `border-default` | `#E2E4EC` | ![#E2E4EC](https://via.placeholder.com/20/E2E4EC/E2E4EC) | Card borders |
| `border-subtle` | `#EDEFF5` | ![#EDEFF5](https://via.placeholder.com/20/EDEFF5/EDEFF5) | Subtle separators |
| `border-focus` | `#2C9A94` | ![#2C9A94](https://via.placeholder.com/20/2C9A94/2C9A94) | Focus rings |

### Text

| Token | Hex | Preview | Usage |
|---|---|---|---|
| `text-primary` | `#1A1D27` | ![#1A1D27](https://via.placeholder.com/20/1A1D27/1A1D27) | Headings, primary text |
| `text-secondary` | `#5A6178` | ![#5A6178](https://via.placeholder.com/20/5A6178/5A6178) | Body text, descriptions |
| `text-tertiary` | `#8B93A7` | ![#8B93A7](https://via.placeholder.com/20/8B93A7/8B93A7) | Placeholders, captions |
| `text-inverse` | `#FFFFFF` | ![#FFFFFF](https://via.placeholder.com/20/FFFFFF/FFFFFF) | Text on primary buttons |

### Primary — Teal (darker for contrast on white)

| Token | Hex | Preview | Usage |
|---|---|---|---|
| `primary-400` | `#2C9A94` | ![#2C9A94](https://via.placeholder.com/20/2C9A94/2C9A94) | **Main primary — buttons, links** |
| `primary-500` | `#1A7A74` | ![#1A7A74](https://via.placeholder.com/20/1A7A74/1A7A74) | Hover state |
| `primary-600` | `#0F5F5A` | ![#0F5F5A](https://via.placeholder.com/20/0F5F5A/0F5F5A) | Active/pressed state |
| `primary-50` | `#EFFEFA` | ![#EFFEFA](https://via.placeholder.com/20/EFFEFA/EFFEFA) | Tinted card backgrounds |
| `primary-100` | `#C7FBF1` | ![#C7FBF1](https://via.placeholder.com/20/C7FBF1/C7FBF1) | Light badges |

### Secondary — Indigo (deeper for readability)

| Token | Hex | Preview | Usage |
|---|---|---|---|
| `secondary-400` | `#6366F1` | ![#6366F1](https://via.placeholder.com/20/6366F1/6366F1) | **Secondary actions** |
| `secondary-500` | `#4F46E5` | ![#4F46E5](https://via.placeholder.com/20/4F46E5/4F46E5) | Hover state |
| `secondary-600` | `#4338CA` | ![#4338CA](https://via.placeholder.com/20/4338CA/4338CA) | Active state |

### Status / Semantic Colors (Light)

| Token | Hex | Preview | Usage |
|---|---|---|---|
| `success` | `#059669` | ![#059669](https://via.placeholder.com/20/059669/059669) | Healthy (darker for contrast) |
| `success-muted` | `#ECFDF5` | ![#ECFDF5](https://via.placeholder.com/20/ECFDF5/ECFDF5) | Success badge bg |
| `warning` | `#D97706` | ![#D97706](https://via.placeholder.com/20/D97706/D97706) | Warning (darker for contrast) |
| `warning-muted` | `#FFFBEB` | ![#FFFBEB](https://via.placeholder.com/20/FFFBEB/FFFBEB) | Warning badge bg |
| `error` | `#DC2626` | ![#DC2626](https://via.placeholder.com/20/DC2626/DC2626) | Critical |
| `error-muted` | `#FEF2F2` | ![#FEF2F2](https://via.placeholder.com/20/FEF2F2/FEF2F2) | Error badge bg |
| `info` | `#2563EB` | ![#2563EB](https://via.placeholder.com/20/2563EB/2563EB) | Informational |
| `info-muted` | `#EFF6FF` | ![#EFF6FF](https://via.placeholder.com/20/EFF6FF/EFF6FF) | Info badge bg |

### Chart Colors (Light — slightly deeper for white bg)

| Token | Hex | Preview |
|---|---|---|
| `chart-1` | `#2C9A94` | ![#2C9A94](https://via.placeholder.com/20/2C9A94/2C9A94) |
| `chart-2` | `#6366F1` | ![#6366F1](https://via.placeholder.com/20/6366F1/6366F1) |
| `chart-3` | `#059669` | ![#059669](https://via.placeholder.com/20/059669/059669) |
| `chart-4` | `#D97706` | ![#D97706](https://via.placeholder.com/20/D97706/D97706) |
| `chart-5` | `#DC2626` | ![#DC2626](https://via.placeholder.com/20/DC2626/DC2626) |
| `chart-6` | `#7C3AED` | ![#7C3AED](https://via.placeholder.com/20/7C3AED/7C3AED) |

### Glassmorphism Tokens (Light)

| Token | Value | Usage |
|---|---|---|
| `glass-bg` | `rgba(255, 255, 255, 0.72)` | Glass panel background |
| `glass-border` | `rgba(226, 228, 236, 0.6)` | Glass border |
| `glass-blur` | `backdrop-filter: blur(16px)` | Frosted effect |

---

## Shadows

### Dark Theme
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.6);
--shadow-glow: 0 0 24px rgba(78, 205, 196, 0.08);
```

### Light Theme
```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.10);
--shadow-glow: 0 0 24px rgba(44, 154, 148, 0.06);
```

---

## Typography Pairing (keep current)

| Usage | Font | Weight |
|---|---|---|
| Headings & UI | **Outfit** | 600–800 |
| Data & Code | **JetBrains Mono** | 400–600 |

---

## 🔑 Why This Palette Works

1. **Teal > Cyan**: Teal (`#4ECDC4`) is warmer and more sophisticated than pure cyan. It still feels "electric/EV" without looking like a Tron screenshot.
2. **Slate Blue > Purple**: `#7C8CF5` is a cooler, more muted blue-violet that pairs harmoniously with teal instead of creating the overused cyan+purple clash.
3. **Layered surfaces**: 4 levels of surface depth (`base → surface → raised → overlay`) create real visual hierarchy vs. the current flat dark bg.
4. **Light theme isn't an afterthought**: Primary colors shift darker on light backgrounds to maintain WCAG AA contrast ratios.
5. **Muted semantic backgrounds**: Status colors get a `*-muted` variant for badge/tag backgrounds — much more refined than slapping a border on a colored badge.

---

## Figma Setup Tips

1. **Create a "Colors" page** with swatches for each token above
2. **Use Figma Variables** — create two variable collections: `Light` and `Dark`, map each token name to both hex values
3. **Set up component variants** for cards/buttons that swap their variable mode between Light/Dark
4. **For glassmorphism**: apply `bg-surface` fill at 72-75% opacity + Background Blur of 16px in Figma's layer panel
