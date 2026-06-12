---
name: Obsidian Flux
colors:
  surface: '#121416'
  surface-dim: '#121416'
  surface-bright: '#38393c'
  surface-container-lowest: '#0c0e10'
  surface-container-low: '#1a1c1e'
  surface-container: '#1e2022'
  surface-container-high: '#282a2c'
  surface-container-highest: '#333537'
  on-surface: '#e2e2e5'
  on-surface-variant: '#c4c7cb'
  inverse-surface: '#e2e2e5'
  inverse-on-surface: '#2f3133'
  outline: '#8e9196'
  outline-variant: '#44474b'
  surface-tint: '#bac8d7'
  primary: '#bac8d7'
  on-primary: '#25323d'
  primary-container: '#34414d'
  on-primary-container: '#9fadbb'
  inverse-primary: '#53606d'
  secondary: '#c4c7c9'
  on-secondary: '#2e3133'
  secondary-container: '#46494b'
  on-secondary-container: '#b6b9bb'
  tertiary: '#c2c7ce'
  on-tertiary: '#2c3136'
  tertiary-container: '#3b4046'
  on-tertiary-container: '#a7acb2'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d6e4f3'
  primary-fixed-dim: '#bac8d7'
  on-primary-fixed: '#101d28'
  on-primary-fixed-variant: '#3b4854'
  secondary-fixed: '#e1e3e5'
  secondary-fixed-dim: '#c4c7c9'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#dee3ea'
  tertiary-fixed-dim: '#c2c7ce'
  on-tertiary-fixed: '#171c21'
  on-tertiary-fixed-variant: '#42474d'
  background: '#121416'
  on-background: '#e2e2e5'
  surface-variant: '#333537'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.03em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is a sophisticated evolution of techno-minimalism, drawing inspiration from the new app icon's interplay of charcoal tones and organic, sweeping curves. It targets a professional, tech-savvy audience that values precision and understated elegance.

The visual language balances the rigidity of a grid-based system with "organic tech" flourishes—specifically, the sharp-to-tapered arcs seen in the brand mark. The mood is deep, cinematic, and high-performance, evoking the feeling of premium hardware or advanced developer tools. It avoids generic tech tropes in favor of a monolithic, sculptural aesthetic characterized by deep matte surfaces and needle-thin accents.

## Colors

The palette is rooted in the "Steel Charcoal" of the icon, utilizing a monochromatic scale that emphasizes texture and depth over hue.

- **Primary:** A desaturated, deep slate-blue derived directly from the icon’s fill. Used for key interactive states and focal points.
- **Secondary:** A bright, cool off-white for high-contrast typography and critical UI markers.
- **Tertiary:** A mid-tier charcoal for containers and borders that separate content without breaking the dark immersion.
- **Neutral:** A near-black base that serves as the infinite canvas, ensuring the high-contrast elements "pop" with cinematic clarity.

## Typography

The typography strategy mirrors the technical but fluid nature of the icon.

**Geist** is used for headlines to provide a surgical, geometric precision that feels contemporary and high-tech. **Hanken Grotesk** offers a more approachable and legible experience for long-form body text, maintaining the system's modernist roots. For metadata, code, and system status, **JetBrains Mono** introduces a monospaced "hacker" aesthetic that reinforces the techno-minimalist theme. All type scales favor tight tracking for headlines and generous leading for body text to ensure a premium feel.

## Layout & Spacing

This design system employs a **Fixed Grid** philosophy on desktop (12 columns) and a **Fluid Grid** on mobile (4 columns). The layout is built on a 4px baseline grid to ensure mathematical alignment across all components.

Spacing is used to create "zones of focus." High-density information is housed in structured modules, while significant negative space is placed between high-level sections to mimic the airy, expansive feel of the icon's background. Desktop layouts should maintain generous outer margins (64px) to create a centered, "app-like" experience even on ultrawide monitors.

## Elevation & Depth

Depth is communicated through **Tonal Layering** and **Subtle Inner Glows**, mimicking the layered construction of the icon.

Instead of heavy drop shadows, surfaces are defined by their background color:

1. **Base:** Neutral Black (#0D0F11).
2. **Raised Surfaces:** Tertiary Charcoal (#1A1F24).
3. **Floating Elements:** Primary Slate (#34414D) with a subtle 1px "rim light" border in a lighter shade to define edges against the dark background.

Interactive elements use a soft, 10% opacity "Steel" glow rather than a traditional shadow, making them appear as if they are backlit components of a high-end interface.

## Shapes

The shape language is the core of this system's identity. We utilize **Rounded** (0.5rem) corners for primary containers to match the icon's squircle base.

However, a specific "Flux Stroke" is introduced for iconography and decorative elements: lines should feature one rounded end and one tapered, sharp end, directly referencing the sweeping arc in the app icon. This juxtaposition of "standard" rounded containers and "aggressive" organic strokes creates the unique techno-minimalist tension that defines the product.

## Components

- **Buttons:** Primary buttons are solid Charcoal (#34414D) with secondary text. The corners are moderately rounded (Level 2). For a "High-Tech" feel, hover states should trigger a 1px secondary-color border that appears to "draw" itself around the perimeter.
- **Inputs:** Ultra-minimalist. Only a bottom border is visible in default states. Upon focus, the border expands into a full-perimeter outline with a subtle inner glow.
- **Cards:** No shadows. Cards are defined by a 1px border in Tertiary (#1A1F24) and a slight change in background tone.
- **Chips/Labels:** These utilize the **JetBrains Mono** font and are strictly rectangular or pill-shaped, providing a sharp contrast to the sweeping curves used in the branding.
- **The "Pulse" Indicator:** A signature component for status—a small, glowing dot that uses a subtle breathing animation, referencing the circular core of the icon.
