# Gallery Frontend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete single-file `index.html` art gallery landing page — 6 sections, 6 paintings, 3 artists, filter, messenger CTA, ArtPlacer wall try-on, mobile responsive.

**Architecture:** One file `index.html` — all CSS in `<style>`, all markup in `<body>` (6 sections), all JavaScript in `<script>`. Placeholder images from picsum.photos until real photos are supplied. No build tools, no frameworks, no npm.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, Google Fonts CDN (Playfair Display + Inter), ArtPlacer embed widget.

---

## File Structure

```
my-galereya-project/
├── index.html                    ← single source of truth
└── images/
    ├── paintings/
    │   └── p01.jpg … p06.jpg     ← real photos go here (Task 10)
    └── artists/
        └── a1.jpg  a2.jpg  a3.jpg
```

---

## Task 1: HTML Foundation — skeleton + CSS design system

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create index.html**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Галерея — Авторские картины маслом</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:           #F3EBE2;
      --bg-dark:      #1A1A1A;
      --text:         #1A1A1A;
      --text-sec:     #3D3D3D;
      --text-inv:     #FFFFFF;
      --border:       #C5BEB6;
      --accent:       #D4916E;
      --font-head:    'Playfair Display', serif;
      --font-body:    'Inter', sans-serif;
      --r-btn:        4px;
      --r-card:       4px;
      --pad-section:  80px;
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      font-size: 16px;
      line-height: 1.6;
    }
  </style>
</head>
<body>

<script>
  // data and logic added in later tasks
</script>
</body>
</html>
```

- [ ] **Step 2: Open in browser**

Открыть `index.html` двойным кликом в Chrome/Firefox.  
Ожидаемо: пустая страница цвета льна `#F3EBE2`, ошибок в DevTools Console нет.

- [ ] **Step 3: Commit**

```
git add index.html
git commit -m "feat: HTML skeleton with CSS design system"
```

---

## Task 2: NAV — фиксированная навигация

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Добавить CSS навигации в `<style>` (перед `</style>`)**

```css
/* ── NAV ── */
.nav {
  position: fixed; top: 0; left: 0; right: 0;
  z-index: 100;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 40px;
  justify-content: space-between;
}

.nav__logo {
  font-family: var(--font-head);
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  text-decoration: none;
  letter-spacing: 0.02em;
}

.nav__links {
  display: flex;
  gap: 32px;
  list-style: none;
}

.nav__links a {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  text-decoration: none;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: color 0.2s;
}

.nav__links a:hover { color: var(--accent); }

body { padding-top: 64px; }
```

- [ ] **Step 2: Добавить HTML навигации в `<body>` (перед `<script>`)**

```html
<nav class="nav">
  <a href="#" class="nav__logo">Галерея</a>
  <ul class="nav__links">
    <li><a href="#catalog">Каталог</a></li>
    <li><a href="#artists">Художники</a></li>
    <li><a href="#tryout">Примерка</a></li>
    <li><a href="#contact">Контакт</a></li>
  </ul>
</nav>
```

- [ ] **Step 3: Проверить в браузере**

Ожидаемо: фиксированная полоса вверху — лого слева, 4 ссылки справа, граница снизу. При наведении на ссылку — терракотовый цвет.

- [ ] **Step 4: Commit**

```
git add index.html
git commit -m "feat: fixed navigation bar"
```

---

## Task 3: HERO секция

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Добавить CSS hero в `<style>`**

```css
/* ── HERO ── */
.hero {
  background: var(--bg-dark);
  color: var(--text-inv);
  padding: 120px 40px 100px;
  min-height: 600px;
  display: flex;
  align-items: center;
}

.hero__inner { max-width: 760px; }

.hero__eyebrow {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 24px;
}

.hero__title {
  font-family: var(--font-head);
  font-size: 64px;
  font-weight: 700;
  line-height: 1.12;
  margin-bottom: 24px;
}

.hero__subtitle {
  font-size: 18px;
  color: rgba(255,255,255,0.7);
  max-width: 520px;
  margin-bottom: 40px;
  line-height: 1.7;
}

/* ── SHARED BUTTONS ── */
.btn {
  display: inline-block;
  padding: 14px 32px;
  border-radius: var(--r-btn);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.2s;
  border: none;
}

.btn:hover { opacity: 0.85; }

.btn--accent {
  background: var(--accent);
  color: var(--text-inv);
}

.btn--outline {
  background: transparent;
  color: var(--text);
  border: 1.5px solid var(--text);
}

.btn--outline-inv {
  background: transparent;
  color: var(--text-inv);
  border: 1.5px solid var(--text-inv);
}
```

- [ ] **Step 2: Добавить HTML hero (после `</nav>`)**

```html
<section class="hero">
  <div class="hero__inner">
    <p class="hero__eyebrow">Авторские работы маслом</p>
    <h1 class="hero__title">Картина, которая<br>станет частью<br>вашего дома</h1>
    <p class="hero__subtitle">Шесть оригинальных работ трёх художников. Примерьте на своей стене — прежде чем принять решение.</p>
    <a href="#catalog" class="btn btn--accent">Смотреть каталог</a>
  </div>
</section>
```

- [ ] **Step 3: Проверить в браузере**

Ожидаемо: тёмный раздел, крупный serif-заголовок 64px, терракотовая кнопка CTA.

- [ ] **Step 4: Commit**

```
git add index.html
git commit -m "feat: hero section"
```

---

## Task 4: Каталог — данные картин + отрисовка карточек

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Добавить HTML каталога (после hero)**

```html
<section id="catalog" class="section">
  <div class="container">
    <h2 class="section__title">Каталог работ</h2>

    <div class="filter-bar">
      <button class="filter-btn filter-btn--active" data-filter="all">Все работы</button>
      <button class="filter-btn" data-filter="artist-1">Художник 1</button>
      <button class="filter-btn" data-filter="artist-2">Художник 2</button>
      <button class="filter-btn" data-filter="artist-3">Художник 3</button>
    </div>

    <div class="cards-grid" id="cardsGrid"></div>
  </div>
</section>
```

- [ ] **Step 2: Добавить CSS каталога в `<style>`**

```css
/* ── SECTIONS shared ── */
.section { padding: var(--pad-section) 40px; }

.container { max-width: 1200px; margin: 0 auto; }

.section__title {
  font-family: var(--font-head);
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 40px;
}

/* ── FILTER ── */
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 20px;
  border-radius: 40px;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  background: transparent;
  color: var(--text);
  border: 1.5px solid var(--border);
}

.filter-btn--active {
  background: var(--text);
  color: var(--text-inv);
  border-color: var(--text);
}

/* ── CARDS GRID ── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* ── PAINTING CARD ── */
.card {
  background: #fff;
  border-radius: var(--r-card);
  overflow: hidden;
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.card__image {
  width: 100%;
  aspect-ratio: 4/5;
  object-fit: cover;
  display: block;
}

.card__body {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card__artist {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
}

.card__title {
  font-family: var(--font-head);
  font-size: 20px;
  font-weight: 400;
  line-height: 1.3;
}

.card__meta {
  font-size: 14px;
  color: var(--text-sec);
  margin-top: 4px;
}

.card__price {
  font-size: 16px;
  font-weight: 600;
  margin-top: auto;
  padding-top: 8px;
}

.card__actions {
  display: flex;
  gap: 8px;
  padding: 16px 20px 20px;
}

.card__actions .btn {
  flex: 1;
  text-align: center;
  padding: 10px 12px;
  font-size: 13px;
}
```

- [ ] **Step 3: Добавить массив картин в `<script>`**

```javascript
const paintings = [
  {
    id: "p01",
    title: "Осенний пейзаж",
    artist: "artist-1",
    artistLabel: "Художник 1",
    technique: "Масло, холст",
    width: 80, height: 60,
    price: 25000,
    image: "https://picsum.photos/seed/p01/600/750",
    wa: "79000000001",
    tg: "username1"
  },
  {
    id: "p02",
    title: "Вечерний берег",
    artist: "artist-1",
    artistLabel: "Художник 1",
    technique: "Масло, холст",
    width: 100, height: 70,
    price: 38000,
    image: "https://picsum.photos/seed/p02/600/750",
    wa: "79000000001",
    tg: "username1"
  },
  {
    id: "p03",
    title: "Белые цветы",
    artist: "artist-2",
    artistLabel: "Художник 2",
    technique: "Масло, холст",
    width: 60, height: 60,
    price: 18000,
    image: "https://picsum.photos/seed/p03/600/750",
    wa: "79000000002",
    tg: "username2"
  },
  {
    id: "p04",
    title: "Городской мотив",
    artist: "artist-2",
    artistLabel: "Художник 2",
    technique: "Масло, холст",
    width: 120, height: 80,
    price: 0,
    image: "https://picsum.photos/seed/p04/600/750",
    wa: "79000000002",
    tg: "username2"
  },
  {
    id: "p05",
    title: "Утренний свет",
    artist: "artist-3",
    artistLabel: "Художник 3",
    technique: "Масло, холст",
    width: 90, height: 70,
    price: 55000,
    image: "https://picsum.photos/seed/p05/600/750",
    wa: "79000000003",
    tg: "username3"
  },
  {
    id: "p06",
    title: "Глубина",
    artist: "artist-3",
    artistLabel: "Художник 3",
    technique: "Масло, холст",
    width: 150, height: 100,
    price: 0,
    image: "https://picsum.photos/seed/p06/600/750",
    wa: "79000000003",
    tg: "username3"
  }
];
```

- [ ] **Step 4: Добавить функции `formatPrice`, `buildContactUrl`, `renderCatalog` в `<script>`**

```javascript
function formatPrice(price) {
  if (!price) return 'Цена по запросу';
  return price.toLocaleString('ru-RU') + ' ₽';
}

function buildContactUrl(p) {
  const msg = encodeURIComponent(`Здравствуйте, интересует картина «${p.title}»`);
  if (p.tg) return `https://t.me/${p.tg}?text=${msg}`;
  return `https://wa.me/${p.wa}?text=${msg}`;
}

function renderCatalog(filter) {
  const grid = document.getElementById('cardsGrid');
  const list = filter === 'all' ? paintings : paintings.filter(p => p.artist === filter);

  grid.innerHTML = list.map(p => `
    <div class="card" data-artist="${p.artist}">
      <img class="card__image" src="${p.image}" alt="${p.title}" loading="lazy">
      <div class="card__body">
        <span class="card__artist">${p.artistLabel}</span>
        <h3 class="card__title">${p.title}</h3>
        <p class="card__meta">${p.width}×${p.height} см · ${p.technique}</p>
        <p class="card__price">${formatPrice(p.price)}</p>
      </div>
      <div class="card__actions">
        <a href="#tryout" class="btn btn--outline">Примерить</a>
        <a href="${buildContactUrl(p)}" target="_blank" class="btn btn--accent">Написать</a>
      </div>
    </div>
  `).join('');
}

renderCatalog('all');
```

- [ ] **Step 5: Проверить в браузере**

Ожидаемо: 6 карточек в сетке 3 колонки. Загружаются placeholder-фото. Для p04 и p06 — «Цена по запросу». Кнопка «Написать» терракотовая, «Примерить» — с рамкой.

- [ ] **Step 6: Commit**

```
git add index.html
git commit -m "feat: catalog section with painting cards"
```

---

## Task 5: Фильтр по художникам

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Добавить обработчик фильтра в `<script>` (после `renderCatalog('all')`)**

```javascript
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
    btn.classList.add('filter-btn--active');
    renderCatalog(btn.dataset.filter);
  });
});
```

- [ ] **Step 2: Проверить фильтрацию в браузере**

- Нажать «Художник 1» → видны только 2 карточки artist-1
- Нажать «Художник 2» → видны только 2 карточки artist-2
- Нажать «Все работы» → все 6 карточек

- [ ] **Step 3: Commit**

```
git add index.html
git commit -m "feat: catalog filter by artist"
```

---

## Task 6: Секция WALL TRYOUT — Canvas-примерка (бесплатно)

> ArtPlacer заменён на собственную Canvas-реализацию. Причина: платный сервис, запуск на бесплатном варианте, переход на ArtPlacer возможен позже.

**Files:**
- Modify: `index.html`
- Удалить из `<head>`: `<script src="https://www.artplacer.com/assets/widget.js"></script>`

**Как работает:**
1. Пользователь нажимает «Примерить» на карточке → картина становится активной, страница скроллит в #tryout
2. Пользователь загружает фото своей стены → фото рисуется на Canvas
3. Картина рисуется поверх фото; можно перетаскивать мышью / пальцем
4. Кнопки «+» / «–» меняют размер картины
5. Кнопка «Скачать» — сохраняет результат

- [ ] **Step 1: Добавить CSS секции примерки в `<style>`**

```css
/* ── WALL TRYOUT ── */
.tryout {
  background: var(--bg-dark);
  color: var(--text-inv);
  padding: var(--pad-section) 40px;
}

.tryout__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: start;
}

.tryout__label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 20px;
}

.tryout__title {
  font-family: var(--font-head);
  font-size: 40px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 20px;
}

.tryout__text {
  font-size: 16px;
  color: rgba(255,255,255,0.65);
  line-height: 1.75;
  margin-bottom: 24px;
}

.tryout__steps {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.tryout__steps li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: 15px;
  color: rgba(255,255,255,0.7);
}

.tryout__steps li span.step-num {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}

/* Canvas area */
.tryout__canvas-wrap {
  position: relative;
}

.tryout__canvas-placeholder {
  background: rgba(255,255,255,0.04);
  border: 2px dashed rgba(255,255,255,0.15);
  border-radius: 8px;
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: rgba(255,255,255,0.4);
  font-size: 14px;
  text-align: center;
  padding: 32px;
}

.tryout__canvas-placeholder svg {
  opacity: 0.3;
}

#tryoutCanvas {
  width: 100%;
  border-radius: 8px;
  display: none;
  cursor: grab;
}

#tryoutCanvas:active { cursor: grabbing; }

.tryout__selected-painting {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: rgba(212,145,110,0.15);
  border: 1px solid rgba(212,145,110,0.35);
  border-radius: 4px;
  font-size: 14px;
  color: var(--accent);
  display: none;
}

.tryout__controls {
  display: none;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.tryout__controls .btn {
  padding: 8px 16px;
  font-size: 13px;
}
```

- [ ] **Step 2: Добавить HTML секции (после каталога)**

```html
<section id="tryout" class="tryout">
  <div class="tryout__inner">
    <div>
      <p class="tryout__label">Примерка на вашей стене</p>
      <h2 class="tryout__title">Как будет смотреться<br>картина у вас?</h2>
      <p class="tryout__text">Загрузите фото своей стены и посмотрите, как картина впишется в ваш интерьер.</p>
      <ol class="tryout__steps">
        <li><span class="step-num">1</span><span>Нажмите «Примерить» на любой карточке выше</span></li>
        <li><span class="step-num">2</span><span>Загрузите фото своей стены</span></li>
        <li><span class="step-num">3</span><span>Перетащите картину в нужное место</span></li>
      </ol>
      <a href="#catalog" class="btn btn--outline-inv">Выбрать картину</a>
    </div>
    <div class="tryout__canvas-wrap">
      <div id="tryoutSelectedInfo" class="tryout__selected-painting"></div>
      <div id="tryoutPlaceholder" class="tryout__canvas-placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <span>Выберите картину из каталога,<br>затем загрузите фото стены</span>
      </div>
      <canvas id="tryoutCanvas"></canvas>
      <div id="tryoutControls" class="tryout__controls">
        <label class="btn btn--outline-inv" style="cursor:pointer">
          Загрузить фото стены
          <input type="file" id="wallPhotoInput" accept="image/*" style="display:none">
        </label>
        <button class="btn btn--outline-inv" id="sizeUp">+ Больше</button>
        <button class="btn btn--outline-inv" id="sizeDown">– Меньше</button>
        <button class="btn btn--accent" id="saveResult">Скачать</button>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Добавить JavaScript примерки в `<script>` (после фильтра)**

```javascript
// ── WALL TRYOUT ──
let tryoutPainting = null; // { img, title, widthCm, heightCm }
let wallImg = null;
const canvas = document.getElementById('tryoutCanvas');
const ctx = canvas.getContext('2d');

// painting position & size on canvas
let paintX = 60, paintY = 60, paintW = 180;

// drag state
let dragging = false, dragOffX = 0, dragOffY = 0;

function selectPaintingForTryout(p) {
  tryoutPainting = p;
  document.getElementById('tryoutSelectedInfo').style.display = 'block';
  document.getElementById('tryoutSelectedInfo').textContent =
    'Выбрана: ' + p.title + ' (' + p.width + '×' + p.height + ' см)';
  document.getElementById('tryoutControls').style.display = 'flex';
  // reset position
  paintX = 60; paintY = 60;
  paintW = 200;
  if (wallImg) drawCanvas();
}

function drawCanvas() {
  if (!wallImg) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(wallImg, 0, 0, canvas.width, canvas.height);
  if (!tryoutPainting) return;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const ratio = img.naturalHeight / img.naturalWidth;
    const paintH = paintW * ratio;
    ctx.drawImage(img, paintX, paintY, paintW, paintH);
    // thin shadow border
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(paintX, paintY, paintW, paintH);
  };
  img.src = tryoutPainting.image;
}

function getPaintH() {
  if (!tryoutPainting) return paintW;
  const img = new Image();
  img.src = tryoutPainting.image;
  const ratio = (img.naturalHeight || 1) / (img.naturalWidth || 1);
  return paintW * ratio;
}

document.getElementById('wallPhotoInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    const img = new Image();
    img.onload = function() {
      wallImg = img;
      canvas.width = 800;
      canvas.height = Math.round(800 * img.naturalHeight / img.naturalWidth);
      document.getElementById('tryoutPlaceholder').style.display = 'none';
      canvas.style.display = 'block';
      drawCanvas();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

document.getElementById('sizeUp').addEventListener('click', () => { paintW = Math.min(paintW + 30, canvas.width - paintX); drawCanvas(); });
document.getElementById('sizeDown').addEventListener('click', () => { paintW = Math.max(paintW - 30, 60); drawCanvas(); });

document.getElementById('saveResult').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'примерка-картины.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// drag on canvas
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleX;
  const pH = getPaintH();
  if (mx >= paintX && mx <= paintX + paintW && my >= paintY && my <= paintY + pH) {
    dragging = true;
    dragOffX = mx - paintX;
    dragOffY = my - paintY;
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  paintX = (e.clientX - rect.left) * scaleX - dragOffX;
  paintY = (e.clientY - rect.top) * scaleX - dragOffY;
  drawCanvas();
});

canvas.addEventListener('mouseup', () => { dragging = false; });
canvas.addEventListener('mouseleave', () => { dragging = false; });

// touch support
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const t = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const mx = (t.clientX - rect.left) * scaleX;
  const my = (t.clientY - rect.top) * scaleX;
  const pH = getPaintH();
  if (mx >= paintX && mx <= paintX + paintW && my >= paintY && my <= paintY + pH) {
    dragging = true;
    dragOffX = mx - paintX;
    dragOffY = my - paintY;
  }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  if (!dragging) return;
  e.preventDefault();
  const t = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  paintX = (t.clientX - rect.left) * scaleX - dragOffX;
  paintY = (t.clientY - rect.top) * scaleX - dragOffY;
  drawCanvas();
}, { passive: false });

canvas.addEventListener('touchend', () => { dragging = false; });
```

- [ ] **Step 4: Обновить кнопку «Примерить» в `renderCatalog` — передавать объект картины**

Заменить в `renderCatalog`:
```javascript
<a href="#tryout" class="btn btn--outline">Примерить</a>
```
На:
```javascript
<button class="btn btn--outline" onclick="selectPaintingForTryout(paintings.find(x=>x.id==='${p.id}'));document.getElementById('tryout').scrollIntoView({behavior:'smooth'})">Примерить</button>
```

- [ ] **Step 5: Проверить в браузере**

- Нажать «Примерить» на карточке → страница скроллит в #tryout, появляется «Выбрана: Осенний пейзаж»
- Нажать «Загрузить фото стены» → выбрать любое фото → фото отображается на canvas
- Картина появляется поверх фото → можно перетащить
- Кнопки «+ Больше» / «– Меньше» меняют размер
- «Скачать» сохраняет PNG

- [ ] **Step 6: Commit**

```
git add index.html
git commit -m "feat: canvas wall try-on (free, no ArtPlacer)"
```

---

## Task 7: Секция ХУДОЖНИКИ

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Добавить CSS художников в `<style>`**

```css
/* ── ARTISTS ── */
.artists { padding: var(--pad-section) 40px; }

.artists__inner { max-width: 1200px; margin: 0 auto; }

.artists__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  margin-top: 40px;
}

.artist-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.artist-card__photo {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 4px;
  filter: grayscale(15%);
}

.artist-card__name {
  font-family: var(--font-head);
  font-size: 22px;
  font-weight: 700;
}

.artist-card__bio {
  font-size: 15px;
  color: var(--text-sec);
  line-height: 1.75;
}
```

- [ ] **Step 2: Добавить HTML художников (после tryout)**

```html
<section id="artists" class="artists">
  <div class="artists__inner">
    <h2 class="section__title">Художники</h2>
    <div class="artists__grid">

      <div class="artist-card">
        <img class="artist-card__photo" src="https://picsum.photos/seed/a1/400/400" alt="Художник 1" loading="lazy">
        <h3 class="artist-card__name">Имя Художника 1</h3>
        <p class="artist-card__bio">Живёт и работает в Москве. Окончил Суриковский институт, специализация — пейзаж. Пишет на пленэре, стиль — тёплый реализм с элементами импрессионизма.</p>
      </div>

      <div class="artist-card">
        <img class="artist-card__photo" src="https://picsum.photos/seed/a2/400/400" alt="Художник 2" loading="lazy">
        <h3 class="artist-card__name">Имя Художника 2</h3>
        <p class="artist-card__bio">Художник-флорист из Санкт-Петербурга. Более 15 лет работает с масляной живописью. Участник международных выставок, работы в частных коллекциях Европы.</p>
      </div>

      <div class="artist-card">
        <img class="artist-card__photo" src="https://picsum.photos/seed/a3/400/400" alt="Художник 3" loading="lazy">
        <h3 class="artist-card__name">Имя Художника 3</h3>
        <p class="artist-card__bio">Городской пейзажист. Вдохновляется современной архитектурой и светом больших городов. Преподаёт живопись в частной студии.</p>
      </div>

    </div>
  </div>
</section>
```

- [ ] **Step 3: Проверить в браузере**

Ожидаемо: 3 колонки с квадратными фото художников, имена Playfair Display, биографии Inter.

- [ ] **Step 4: Commit**

```
git add index.html
git commit -m "feat: artists section"
```

---

## Task 8: FOOTER с контактами

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Добавить CSS футера в `<style>`**

```css
/* ── FOOTER ── */
.footer {
  background: var(--accent);
  color: var(--text-inv);
  padding: 60px 40px;
}

.footer__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 40px;
  flex-wrap: wrap;
}

.footer__logo {
  font-family: var(--font-head);
  font-size: 28px;
  font-weight: 700;
  color: var(--text-inv);
  text-decoration: none;
  display: block;
  margin-bottom: 12px;
}

.footer__tagline {
  font-size: 14px;
  opacity: 0.75;
  max-width: 260px;
  line-height: 1.65;
}

.footer__cta-title {
  font-family: var(--font-head);
  font-size: 22px;
  margin-bottom: 16px;
}

.footer__links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer__links a {
  color: var(--text-inv);
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;
  opacity: 0.9;
  transition: opacity 0.2s;
}

.footer__links a:hover { opacity: 1; }

.footer__copy {
  max-width: 1200px;
  margin: 40px auto 0;
  padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,0.25);
  font-size: 12px;
  opacity: 0.6;
  letter-spacing: 0.04em;
}
```

- [ ] **Step 2: Добавить HTML футера (после artists, перед `<script>`)**

```html
<footer id="contact" class="footer">
  <div class="footer__inner">
    <div>
      <a href="#" class="footer__logo">Галерея</a>
      <p class="footer__tagline">Авторские картины маслом. Москва.</p>
    </div>
    <div>
      <p class="footer__cta-title">Есть вопросы?<br>Напишите нам</p>
      <div class="footer__links">
        <a href="https://wa.me/79000000000?text=Здравствуйте%2C+интересует+ваша+галерея" target="_blank">WhatsApp</a>
        <a href="https://t.me/username?text=Здравствуйте%2C+интересует+ваша+галерея" target="_blank">Telegram</a>
      </div>
    </div>
  </div>
  <p class="footer__copy">© 2026 Галерея. Все права защищены.</p>
</footer>
```

- [ ] **Step 3: Проверить в браузере**

Ожидаемо: терракотовый футер. Лого слева, контакты справа. Разделительная линия + копирайт внизу.

- [ ] **Step 4: Commit**

```
git add index.html
git commit -m "feat: footer with contact CTA"
```

---

## Task 9: Адаптив — мобильная версия

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Добавить media queries в конец `<style>`**

```css
/* ── MOBILE ── */
@media (max-width: 768px) {
  :root { --pad-section: 48px; }

  .nav { padding: 0 20px; }
  .nav__links { gap: 16px; }
  .nav__links a { font-size: 12px; }

  .hero { padding: 80px 20px 60px; }
  .hero__title { font-size: 38px; }
  .hero__subtitle { font-size: 16px; }

  .section { padding: var(--pad-section) 20px; }
  .section__title { font-size: 28px; }

  .cards-grid { grid-template-columns: 1fr; }

  .tryout { padding: var(--pad-section) 20px; }
  .tryout__inner { grid-template-columns: 1fr; gap: 40px; }
  .tryout__title { font-size: 28px; }

  .artists__grid { grid-template-columns: 1fr; gap: 32px; }

  .footer { padding: 48px 20px; }
  .footer__inner { flex-direction: column; gap: 32px; }
}

@media (max-width: 480px) {
  .nav__links { display: none; }
  .hero__title { font-size: 30px; }
}
```

- [ ] **Step 2: Проверить в браузере на мобильной ширине**

DevTools → режим устройства → iPhone SE (375px).  
Ожидаемо:
- Nav: лого есть, ссылки скрыты (480px)
- Hero: заголовок 30px, читаем
- Каталог: 1 колонка
- Секция tryout: одноколоночная
- Художники: одноколоночные
- Футер: вертикальный

- [ ] **Step 3: Commit**

```
git add index.html
git commit -m "feat: mobile responsive layout"
```

---

## Task 10: Замена placeholder-контента на реальный

**Files:**
- Modify: `index.html`
- Add: `images/paintings/p01.jpg` … `p06.jpg`
- Add: `images/artists/a1.jpg`, `a2.jpg`, `a3.jpg`

> Этот таск выполняется когда реальный контент готов по чек-листу [docs/контент.md](../контент.md).

- [ ] **Step 1: Добавить фото картин**

Разместить файлы:
```
images/paintings/p01.jpg … p06.jpg
```
Минимум 1200×900px, JPG, без рамки, нейтральный фон.

- [ ] **Step 2: Добавить фото художников**

Разместить файлы:
```
images/artists/a1.jpg  a2.jpg  a3.jpg
```
Размер 400×400px, JPG.

- [ ] **Step 3: Обновить массив `paintings` в `<script>`**

Заменить для каждой картины: `image`, `title`, `width`, `height`, `price`, `wa`, `tg`, `artistLabel`. Пример:

```javascript
{
  id: "p01",
  title: "«Настоящее название»",
  artist: "artist-1",
  artistLabel: "Настоящее Имя",
  technique: "Масло, холст",
  width: 80, height: 60,
  price: 25000,
  image: "./images/paintings/p01.jpg",
  wa: "7XXXXXXXXXXX",
  tg: "real_telegram_username"
}
```

- [ ] **Step 4: Обновить HTML секции Художников**

Заменить фото (`src`), имена (`artist-card__name`) и биографии (`artist-card__bio`) на реальные данные.

- [ ] **Step 5: Обновить контакты в футере**

Заменить `79000000000` и `username` в `.footer__links` на реальные WhatsApp и Telegram галереи.

- [ ] **Step 6: Обновить название галереи**

Заменить «Галерея» в `<title>`, `.nav__logo`, `.footer__logo` на реальное название.

- [ ] **Step 7: Финальная проверка в браузере**

- Все 6 картин грузятся с реальными фото
- Цены корректны (price: 0 → «Цена по запросу»)
- Кнопка «Написать» открывает правильный мессенджер с предзаполненным сообщением
- Фото и биографии художников реальные
- Контакты в футере работают

- [ ] **Step 8: Commit**

```
git add index.html images/
git commit -m "content: replace placeholders with real gallery data"
```

---

## Self-Review

**Покрытие ТЗ:**
- [x] 3.1 Карточки с фото, названием, художником, размером, ценой — Task 4
- [x] 3.1 Фильтрация по художнику — Task 5
- [x] 3.1 Кнопки «Примерить» и «Написать» — Task 4
- [x] 3.2 ArtPlacer wall try-on — Task 6
- [x] 3.3 «Написать» → мессенджер с предзаполненным сообщением — Task 4 (buildContactUrl)
- [x] 3.4 Профили художников с фото и биографией — Task 7
- [x] 3.5 Фиксированный nav + плавный скролл — Task 2
- [x] Mobile адаптив — Task 9
- [x] «Цена по запросу» для price: 0 — Task 4 (formatPrice)
- [x] Один файл index.html, без фреймворков — архитектура
- [x] Google Fonts CDN — Task 1
- [x] Замена placeholder → реальный контент — Task 10

**Согласованность типов:**
- `p.artist` (ключ фильтра) = `data-filter` значения = `paintings[].artist` значения — совпадают по всем Task 4–5.
- `buildContactUrl(p)` использует `p.tg` и `p.wa` — оба поля определены в массиве paintings.

**Выбор рамы (реализовано в Task 6):**  
Canvas-рамки без внешних файлов — 5 вариантов: Без рамы / Чёрная / Золото / Белая / Дерево. Бевел-эффект (highlight + shadow) создаёт глубину. Drag-зона включает площадь рамы.

**Решение по анимациям:**  
Вау-эффекты (fade-in, parallax, анимированный градиент) намеренно исключены. Дизайн — строгий галерейный минимализм. Вау-эффект это сами картины, а не интерфейс.
