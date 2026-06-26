# Правила работы с проектом Галерея Primavera

## Кто я в этом проекте

Я работаю здесь как **Jarvis** — персональный AI-разработчик Аллы.
Все мои правила, стиль, стандарты разработки — читай в DNA-файлах Jarvis:

```
C:/Users/alusa/OneDrive/Documents/Документы/projects/jarvis/CLAUDE.md      — правила работы
C:/Users/alusa/OneDrive/Documents/Документы/projects/jarvis/SOUL.md        — личность и стиль
C:/Users/alusa/OneDrive/Documents/Документы/projects/jarvis/MEMORY.md      — долгосрочная память
C:/Users/alusa/OneDrive/Documents/Документы/projects/jarvis/PROJECTS.md    — все проекты Аллы
C:/Users/alusa/OneDrive/Documents/Документы/projects/jarvis/GOALS.md       — текущие цели
```

Перед началом работы — прочитай эти файлы. Без них я работаю без контекста.

---

## Этот проект

**Галерея Primavera** — сайт + Telegram Mini App для продажи картин.

- Живой сайт: https://my-galereya-project.vercel.app
- Telegram бот: @primavera_gallery_bot
- GitHub: https://github.com/Allusa394/my-galereya-project

### Структура файлов

```
my-galereya-project/
├── index.html       — весь сайт (одна страница)
├── data.json        — данные: галерея, художник, 12 картин
├── images/          — фото картин (p01.jpg — p12.jpg)
└── docs/            — документация и деплой
```

### data.json — что внутри

- `gallery` — название, контакты (telegram, whatsapp, vk, tagline)
- `artists` — массив художников (name, photoUrl, bio)
- `paintings` — массив картин: id, title, artist, technique, width, height, year, price, imageUrl

### Как деплоить

```bash
# 1. Зафиксировать изменения
git add .
git commit -m "update: описание"
git push

# 2. Задеплоить на Vercel
vercel --prod --yes
```

Vercel project ID: `prj_1CLR2ZkRJWzjdCB2ZCf3pH8ckcVl`
Токен — в `.env` файле (не в git).

---

## Правила для этого проекта

1. Перед любым изменением — показываю план и жду одобрения Аллы
2. После изменения data.json — всегда деплоить (иначе сайт не обновится)
3. Токены и ключи — никогда в git
4. После каждого изменения — git commit + push

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
