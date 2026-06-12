# GlassBox

A **physically-inspired glass surface** component for React. It uses an SVG displacement-map filter piped into `backdrop-filter` to refract the content behind it — exactly like a real piece of frosted glass — and gracefully degrades to a `backdrop-filter: blur()` fallback on Safari/Firefox, or a static frosted background where no backdrop support exists.

---

## Table of Contents

1. [How it works](#how-it-works)
2. [Rendering tiers](#rendering-tiers)
3. [Import](#import)
4. [Props reference](#props-reference)
5. [SVG filter pipeline (deep dive)](#svg-filter-pipeline-deep-dive)
6. [Default values](#default-values)
7. [Recipes](#recipes)
8. [CSS custom properties](#css-custom-properties)
9. [Behaviour notes](#behaviour-notes)
10. [Browser support](#browser-support)

---

## How it works

GlassBox produces its effect in three layers stacked inside a single `<div>`:

```
┌─────────────────────────────────────────┐
│  Outer div  (backdrop-filter applied)   │  ← The "glass pane"
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Hidden SVG  (opacity: 0, z:-10)  │  │  ← Defines the SVG filter
│  │  <filter id="glass-filter-…">     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Content wrapper  (z: 10)         │  │  ← Your children
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

The SVG filter is referenced by `backdrop-filter: url(#glass-filter-…)`. The browser feeds *whatever is painted behind the element* through the filter before compositing it — producing genuine optical distortion, not just blur.

---

## Rendering tiers

The component detects capabilities at mount time and picks the best available tier:

| Tier | Condition | Effect |
|------|-----------|--------|
| **SVG** (full) | Chromium-based browser + `backdrop-filter: url(…)` supported | SVG displacement-map refracts background; full chromatic aberration, inner glow, and inset shadows |
| **CSS fallback** | Safari / Firefox with `backdrop-filter: blur()` | `blur(12px) saturate(1.8) brightness(1.2/1.1)` + semi-transparent background |
| **Static fallback** | No backdrop-filter support at all | Opaque frosted-looking background with inset border highlight |

The tier is chosen **once** on mount (`useEffect`) and stored in `svgSupported` state. Each tier also adapts its colours to the system **dark/light mode** via the `useDarkMode` hook (listens to `prefers-color-scheme`).

---

## Import

```tsx
// Preferred — via the shared barrel
import { GlassBox } from '@components';

// Direct (for shared package internal use)
import GlassBox from '@common/components/GlassBox/GlassBox';
```

The named export `GlassBox` and the default export `GlassSurface` refer to the same component. The barrel re-exports the default as `GlassBox`.

---

## Props reference

All props are optional. Omit any you don't need — sensible defaults are applied.

### Layout & shape

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number \| string` | `200` | Width of the glass pane. Pass a number for px, or any CSS string (`"100%"`, `"auto"`, `"50vw"`, …). |
| `height` | `number \| string` | `80` | Height of the glass pane. Same rules as `width`. |
| `borderRadius` | `number` | `20` | Corner radius in **px**. Applied to the outer container, the inner SVG displacement-map rects, and the children wrapper (`rounded-[inherit]`). |

### Displacement map — form of the glass

These props control the **SVG displacement-map image** that is baked as a `data:image/svg+xml` URL and fed into `<feImage>`. Changing them forces the map to regenerate.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `borderWidth` | `number` | `0.07` | Thickness of the gradient edge band as a **fraction of the shorter dimension** (e.g. `0.07` → 3.5 % of `min(w, h)`). Controls how wide the refractive "rim" of the glass is. Raise it for a thicker, lens-like edge. |
| `brightness` | `number` | `100` | Lightness (HSL %) of the frosted inner rect drawn on the displacement map. `100` = white, `0` = black. Affects how "milky" the centre of the glass looks when `opacity > 0`. |
| `opacity` | `number` | `0` | Alpha of the frosted inner rect (`0`–`1`). `0` = completely transparent centre (pure refraction only); `1` = fully opaque frosted fill. Use small values like `0.05`–`0.15` for a subtle frost. |
| `blur` | `number` | `10` | `blur()` applied to the frosted inner rect **inside the SVG**. Softens the transition between the edge band and the centre. |
| `mixBlendMode` | see below | `'screen'` | Blend mode used when the blue gradient is composited over the red gradient in the displacement map. Controls the colour of the edge refraction. |

### SVG filter — chromatic aberration & displacement

These props are applied directly to the `<feDisplacementMap>` and `<feGaussianBlur>` filter primitives via `ref.current.setAttribute(…)` after mount.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `distortionScale` | `number` | `20` | Base displacement scale for all three colour channels. Positive = right-down warp, negative = left-up warp. The magnitude is in SVG user-units (roughly pixels). |
| `redOffset` | `number` | `0` | Added to `distortionScale` for the **red** channel only. Use a non-zero value to shift red independently, creating chromatic aberration. |
| `greenOffset` | `number` | `0` | Same for the **green** channel. |
| `blueOffset` | `number` | `0` | Same for the **blue** channel. `blueOffset = 20` with `distortionScale = -180` (old default) created a strong blue-shifted rim. |
| `xChannel` | `'R' \| 'G' \| 'B'` | `'R'` | Which colour channel of the displacement map image drives horizontal displacement. |
| `yChannel` | `'R' \| 'G' \| 'B'` | `'G'` | Which channel drives vertical displacement. |
| `displace` | `number` | `3` | `stdDeviation` of the final `<feGaussianBlur>` applied after RGB channel blending. Softens the overall refraction (not the same as CSS `blur`). Higher = smudgier glass. |

### Visual finish

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backgroundOpacity` | `number` | `0` | Alpha of the tinted background fill in **SVG mode** (`0`–`1`). In dark mode the fill is `hsl(0 0% 0% / backgroundOpacity)`; in light mode `hsl(0 0% 100% / backgroundOpacity)`. Exposes the `--glass-frost` CSS custom property. |
| `saturation` | `number` | `2` | `saturate(n)` appended to `backdrop-filter` in SVG mode. `1` = natural, `>1` = more vivid colours through the glass. Exposes the `--glass-saturation` CSS custom property. |

### `mixBlendMode` values

```
'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' |
'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' |
'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' |
'luminosity' | 'plus-darker' | 'plus-lighter'
```

### DOM pass-through

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Extra classes added to the outer container (alongside the internal Tailwind utility classes). Use for reveal animations, hover states, etc. |
| `style` | `React.CSSProperties` | `{}` | Inline styles merged **before** the computed glass styles. Useful for `minHeight`, `display`, `position`, etc. Note: glass-specific properties (`background`, `backdropFilter`, `boxShadow`, `borderRadius`, `width`, `height`) will be overwritten by the component. |
| `children` | `React.ReactNode` | — | Rendered inside a full-size `div` with `z-index: 10` and `rounded-[inherit]`. |

---

## SVG filter pipeline (deep dive)

```
SourceGraphic
    │
    ├──▶ feDisplacementMap (red channel)  scale = distortionScale + redOffset
    │         └──▶ feColorMatrix → keep R only  → "red"
    │
    ├──▶ feDisplacementMap (green channel) scale = distortionScale + greenOffset
    │         └──▶ feColorMatrix → keep G only  → "green"
    │
    └──▶ feDisplacementMap (blue channel)  scale = distortionScale + blueOffset
              └──▶ feColorMatrix → keep B only  → "blue"

red + green  ──▶ feBlend (screen) ──▶ "rg"
rg  + blue   ──▶ feBlend (screen) ──▶ "output"
                                            │
                                   feGaussianBlur (displace) ──▶ final
```

Each colour channel is displaced independently using the same `<feImage>` displacement map but a potentially different scale (`distortionScale ± offset`). The channels are then isolated with `<feColorMatrix>` and blended back with `screen` blend mode. This is what produces chromatic aberration: the RGB channels land in slightly different positions, just like glass refracting different wavelengths of light by different amounts.

---

## Default values

```tsx
// Current defaults (as of last update)
borderRadius    = 20
borderWidth     = 0.07
brightness      = 100
opacity         = 0
blur            = 10
displace        = 3
backgroundOpacity = 0
saturation      = 2
distortionScale = 20
redOffset       = 0
greenOffset     = 0
blueOffset      = 0
xChannel        = 'R'
yChannel        = 'G'
mixBlendMode    = 'screen'
width           = 200
height          = 80
```

---

## Recipes

### Minimal badge / pill

```tsx
<GlassBox width="auto" height="auto" borderRadius={20}>
  <Box px={4} py={1.5} fontSize="xs" fontWeight="bold">
    Next Gen Audio Mesh Protocol
  </Box>
</GlassBox>
```

### Feature card (full-width, auto-height)

```tsx
<GlassBox
  width="100%"
  height="100%"
  borderRadius={20}
  backgroundOpacity={0.06}
  saturation={1.4}
  style={{ minHeight: '200px' }}
>
  <VStack align="start" p={6} gap={4}>
    <Icon type={IconType.SYNC} size="20px" />
    <Heading as="h3" size="sm">Engineered for Synchronization</Heading>
    <Text fontSize="xs">…</Text>
  </VStack>
</GlassBox>
```

### Frosted modal / panel

```tsx
<GlassBox
  width="480px"
  height="auto"
  borderRadius={24}
  backgroundOpacity={0.12}
  saturation={1.6}
  blur={6}
  opacity={0.08}
  distortionScale={25}
>
  <Box p={8}>…</Box>
</GlassBox>
```

### Strong chromatic aberration (decorative)

```tsx
<GlassBox
  width={300}
  height={120}
  borderRadius={16}
  distortionScale={-80}
  redOffset={20}
  blueOffset={-20}
  saturation={2.5}
  displace={5}
/>
```

### Subtle dark-mode card

```tsx
<GlassBox
  width="100%"
  height="auto"
  borderRadius={16}
  backgroundOpacity={0.05}
  saturation={1.2}
  distortionScale={15}
  displace={2}
  blur={8}
>
  <Box p={5}>…</Box>
</GlassBox>
```

---

## CSS custom properties

The component exposes two CSS custom properties on the outer element that can be read by child CSS:

| Property | Value | Description |
|----------|-------|-------------|
| `--glass-frost` | `backgroundOpacity` | The opacity of the tinted fill layer |
| `--glass-saturation` | `saturation` | The saturation multiplier applied via backdrop-filter |

---

## Behaviour notes

- **ResizeObserver** — the displacement map is regenerated whenever the container changes size, so the edge-band proportions remain correct in fluid / responsive layouts.
- **Width/height changes** — a separate effect watches the `width` and `height` props and regenerates the map with a `setTimeout(0)` to let the browser apply the new dimensions first.
- **`width="auto"` / `height="auto"`** — when passed as strings, the inline style sets `width: auto` / `height: auto`. The ResizeObserver picks up the actual rendered size via `getBoundingClientRect()` and uses that for the SVG map. The fallback dimensions used before mount are 400 × 200.
- **Dark mode** — detected via `window.matchMedia('(prefers-color-scheme: dark)')` with a live `change` listener. Both the background fill colour and the box-shadow change when the system theme switches.
- **SSR safety** — all `window`/`document` access is guarded, so the component renders safely in Node/SSR contexts (SVG features are disabled server-side).
- **Focus visible** — the outer div receives `focus-visible:outline` in Chromium blue (`#0A84FF` dark / `#007AFF` light) via Tailwind's `focus-visible:` variant for keyboard accessibility.
- **Tailwind classes on the outer div** — `relative overflow-hidden transition-opacity duration-[260ms] ease-out`. These cannot be overridden via `className` without a higher-specificity rule.
- **`style` merge order** — your `style` prop is spread first; glass-computed values (`background`, `backdropFilter`, `boxShadow`, `borderRadius`, `width`, `height`) come after and will win.

---

## Browser support

| Browser | Tier | Notes |
|---------|------|-------|
| Chrome / Edge 76+ | SVG (full) | Full displacement-map + chromatic aberration |
| Chrome / Edge < 76 | Static fallback | No backdrop-filter support |
| Safari 9+ | CSS fallback | `backdrop-filter: blur()` supported but `url(#…)` not |
| Firefox | CSS fallback | Same as Safari |
| Firefox < 70 | Static fallback | No backdrop-filter |
| SSR / Node | Static fallback | All browser APIs disabled |
