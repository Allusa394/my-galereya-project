# Design Spec — Gallery Landing Page
**Date:** 2026-05-19  
**Status:** Approved

---

## What We're Building

A single-file static landing page (`index.html`) that acts as an art gallery showcase. Three artists, original oil paintings, prices 5 000–80 000 ₽. No checkout, no registration — all sales happen via WhatsApp/Telegram.

**One-liner:**
> Я создаю онлайн-витрину авторских картин маслом для людей после ремонта, с примеркой картины на фото своей стены и прямым выходом на художника в мессенджере.

---

## Architecture

**Single file, zero dependencies:**
```
index.html
  ├── <style>    — all CSS
  ├── <body>     — 6 sections
  └── <script>   — catalog data + filter logic + ArtPlacer init
```

No build tools, no npm, no frameworks. Fonts via Google CDN. Wall try-on via ArtPlacer embed.

---

## Sections

| # | Section | Purpose |
|---|---|---|
| 1 | NAV | Logo + anchor links, fixed top |
| 2 | HERO | Headline, tagline, CTA button |
| 3 | CATALOG | Filter tabs + painting cards grid |
| 4 | WALL TRYOUT | Feature promo + ArtPlacer widget |
| 5 | ARTISTS | 3 artist profiles |
| 6 | FOOTER | Contact links, copyright |

---

## Components

### Painting Card
```
┌──────────────────┐
│  [Фото картины]  │  460px tall image
│                  │
├──────────────────┤
│ ХУДОЖНИК 1       │  caption, terracotta
│ Осенний пейзаж   │  title, Playfair Display
│ 60×80 см  25 000₽│  meta row
├──────────────────┤
│ [Примерить]  [→] │  2 action buttons
└──────────────────┘
```

- "Примерить на стене" → opens ArtPlacer widget with this painting
- "Написать" → `wa.me/...?text=Интересует+«{title}»`

### Filter Bar
Pills row: Все работы | Художник 1 | Художник 2 | Художник 3  
Active pill: filled black. Inactive: outlined.  
JS toggles `display:none` on cards that don't match active filter.

### ArtPlacer Widget
```html
<script src="https://www.artplacer.com/assets/widget.js"></script>
```
Each painting card passes its image URL + real dimensions (cm) to the widget. User uploads own wall photo → painting overlays in correct scale.

---

## Data Model

```js
const paintings = [
  {
    id: "p01",
    title: "Осенний пейзаж",
    artist: "artist-1",        // for filter
    artistLabel: "Художник 1",
    width: 80,   // cm
    height: 60,  // cm
    price: 25000,
    image: "./images/paintings/p01.jpg",
    contact: { wa: "79XXXXXXXXX", tg: "username" }
  },
  // ...
];
```

---

## Design System

```css
--bg:           #F3EBE2;
--bg-dark:      #1A1A1A;
--text:         #1A1A1A;
--text-secondary: #3D3D3D;
--text-inv:     #FFFFFF;
--border:       #C5BEB6;
--accent:       #D4916E;

--font-heading: 'Playfair Display', serif;
--font-body:    'Inter', sans-serif;

--radius-btn:   4px;
--radius-card:  4px;
--section-pad:  80px (desktop) / 24px (mobile);
```

---

## Out of Scope (v1.0)

- Cart / online payment
- User accounts / login
- CMS for catalog editing
- Blog / SEO subpages
- Email capture / newsletter
- Analytics (add later)

---

## Open Questions (resolved)

| Question | Decision |
|---|---|
| Wall try-on implementation | ArtPlacer widget (free plan) |
| Payment flow | WhatsApp/Telegram only |
| Price ceiling on page | Show up to 80 000 ₽; higher = «цена по запросу» |
| Number of paintings v1 | 6 (2 per artist) |
| Framework | None — vanilla HTML/CSS/JS |
