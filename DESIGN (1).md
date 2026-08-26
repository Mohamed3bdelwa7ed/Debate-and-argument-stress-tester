---
name: DebateAI Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#684000'
  on-tertiary: '#ffffff'
  tertiary-container: '#885500'
  on-tertiary-container: '#ffd4a4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-md:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is anchored in a **Minimalist / Modern Startup** aesthetic, specifically tailored for a premium AI SaaS environment. It prioritizes clarity, intellectual rigor, and professional reliability. The visual narrative avoids the typical "neon-cyberpunk" AI tropes, opting instead for a "Laboratory Clean" look that feels academic yet cutting-edge.

The emotional response should be one of focused intelligence. By utilizing ample whitespace (Minimalism) and high-quality typography, the UI recedes to let the debate content and AI-generated insights take center stage. Subtle tactile elements, like soft shadows and organic rounded corners, prevent the interface from feeling cold or clinical.

## Colors
This design system utilizes a sophisticated, high-contrast palette. The **Primary Indigo** and **Secondary Purple** are used sparingly for interactive elements and brand accents to maintain a professional atmosphere. 

Semantic colors are vital for the debate context:
- **Critic Red** (#EF4444) identifies opposing arguments or logical fallacies.
- **Defender Green** (#10B981) highlights supporting evidence and validated points.
- **Judge Amber** (#F59E0B) is reserved for neutral synthesis, scoring, and final verdicts.

The background uses a cool slate-white (#F8FAFC) to reduce eye strain during long reading sessions, while active surfaces use pure white (#FFFFFF) to create a clear "layering" effect.

## Typography
The system relies exclusively on **Inter** to project a systematic and utilitarian feel. The hierarchy is established through dramatic weight shifts rather than font variety. 

**Key Rules:**
- **Headlines:** Use Bold (700) or Extra Bold (800) with tight letter spacing for a punchy, editorial feel.
- **Body Text:** Use Regular (400) for high legibility. Paragraph spacing should be generous to allow for "breathable" debate transcripts.
- **Labels:** Use Semibold (600) for buttons and navigation items to ensure they stand out against the background surface.

## Layout & Spacing
The design system uses an **8px linear scale** for consistent rhythm. 

**Grid Philosophy:**
- **Desktop:** A 12-column fluid grid with 24px gutters and 48px side margins. Max container width is 1280px to prevent lines of text from becoming too wide for comfortable reading.
- **Tablet:** 8-column grid with 24px gutters and 32px margins.
- **Mobile:** 4-column grid with 16px gutters and 16px margins.

**AI Contexts:** For the debate feed, use a "centered column" layout (approx. 800px wide) to maximize focus. Sidebars for "Agent Stats" or "Debate Metadata" should be docked to the right with a width of 320px.

## Elevation & Depth
Hierarchy is conveyed through **Tonal Layers** and **Ambient Shadows**. 

- **Level 0 (Background):** #F8FAFC - No shadow.
- **Level 1 (Cards/Main Surfaces):** #FFFFFF - 1px solid border (#E2E8F0) with a very soft, diffused shadow: `0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)`.
- **Level 2 (Hover/Active states):** #FFFFFF - Enhanced shadow: `0 10px 15px -3px rgba(0, 0, 0, 0.08)`.
- **Level 3 (Modals/Popovers):** #FFFFFF - Deep shadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1)`.

Avoid using inner shadows or heavy dark borders. All depth should feel light and airy.

## Shapes
The design system employs a **Rounded** language (Level 2) to soften the analytical nature of the content.

- **Standard Elements:** 0.5rem (8px) for inputs, small buttons, and tags.
- **Large Elements (Cards):** 1rem (16px) for debate bubbles, agent profile cards, and container sections.
- **Extra Large Elements:** 1.5rem (24px) for prominent "Call to Action" sections or major dashboard widgets.

Buttons should never be fully square or fully pill-shaped; they should maintain the consistent 8px radius to match the systematic aesthetic.

## Components

### Cards & Agents
Agent cards use the Level 1 elevation. When an agent is "speaking" in the debate, their card should feature a subtle 2px left-border accent in either Primary Indigo, Critic Red, or Defender Green to denote their role.

### Score Indicators
Numerical scores (e.g., 88/100) are displayed in a `headline-sm` font weight. They are housed in a circular "gauge" or a rounded-md badge. Use Judge Amber for final scores and Neutral Slate for mid-debate metrics.

### Selectable Cards
For agent selection or argument picking:
- **Default:** Level 1 elevation, grey border.
- **Selected:** 2px solid Primary Indigo border with a subtle Indigo tint background (5% opacity). Add a checkmark icon in the top-right corner.

### Buttons
- **Primary:** Solid Primary Indigo background, white text.
- **Secondary:** White background, 1px border (#E2E8F0), Primary Indigo text.
- **Ghost:** No background or border, Secondary Text color; turns Primary Indigo on hover.

### Input Fields
Inputs use a white background with a #E2E8F0 border. On focus, the border transitions to Primary Indigo with a 3px soft focus ring (Indigo at 10% opacity).

### Navigation
The Navbar is fixed-top, using a white background with a thin bottom border (#E2E8F0). Use `label-md` for navigation links with 32px horizontal spacing between items.