# ENRG — Токенизация энергии будущего

Футуристический лендинг-портал экосистемы **Axis/ENRG**: тёмный фон, неон,
голограммы и частицы. Главная цель лендинга — провести пользователя в PWA
**Axis Connect** («Подключить устройство») и показать живую статистику
экосистемы.

## Стек

- **React 19 + TypeScript + Vite 8**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Framer Motion** — появление секций, анимированные счётчики
- **Canvas-частицы** — фоновая сеть (без Three.js, лёгкий вес)
- **Шрифты**: Space Grotesk + JetBrains Mono (локальные, через `@fontsource`)

## Структура

```
src/
  main.tsx, App.tsx            — точка входа, сборка секций
  config.ts                    — ссылки (Axis Connect, оракул, docs) и параметры SRC
  index.css, effects.css       — Tailwind-тема, неон/голограмма/кнопки
  lib/
    stats.ts                   — fetch статистики с оракула + fallback (demo) + таймаут
    useAnimatedNumber.ts       — анимированные числа и форматирование
  components/
    Particles.tsx              — фон-частицы (canvas)
    Navbar.tsx                 — меню HOME·DASHBOARD·MINTING·HISTORY·SETTINGS
    Hero.tsx                   — голографический логотип + живая панель энергии
    Stats.tsx                  — статистика экосистемы (кВт·ч / устройства / SRC)
    HowItWorks.tsx             — 3 шага: Подключи → Докажи → Зарабатывай
    Tokenomics.tsx             — экономика SRC, распределение, множители
    Partners.tsx               — Solana, ESP32, Rust, TypeScript
    Cta.tsx                    — «Начать» / «Скачать приложение» → Axis Connect
    Footer.tsx
  ui.tsx                       — SectionHeading, HoloCard, StatusChip, Logo…
public/
  logo.svg, CNAME              — Pages-фавикон и домен enrg.network
  legacy/                      — старые статические страницы (whitepaper, docs, dashboard)
```

## Связка с Axis-connect

- Кнопки **«Подключить устройство»**, **«Скачать приложение»**, **«Начать»** и
  пункты меню **DASHBOARD / SETTINGS** открывают PWA в новом табе:
  `https://antongrid.github.io/Axis-connect/`.
- **Axis Connect** остаётся самостоятельным PWA — лендинг не содержит его кода.

## Статистика экосистемы

- Эндпоинт: `GET https://enrg-oracle.onrender.com/api/v1/stats`
  (CORS разрешён для `enrg.network` и `localhost`).
- Ответ: `{ total_energy_mwh, active_producers, total_supply }`.
- Лендинг показывает: сгенерировано энергии (кВт·ч), активных устройств,
  начислено SRC. Обновление — раз в 60 с, таймаут запроса — 12 с.
- Если API недоступен — отображаются **заглушки** с пометкой `DEMO` и
  анимацией «SYNC · загрузка данных» (см. `src/lib/stats.ts`).

## Запуск

```bash
npm install
npm run dev       # dev-сервер Vite
npm run build     # typecheck + production-сборка в dist/
npm run preview   # превью сборки
```

## Деплой

GitHub Pages через Actions (`.github/workflows/deploy.yml`): `npm ci` →
`npm run build` → upload `dist/` → `deploy-pages`. CNAME (`enrg.network`)
копируется из `public/`. Для работы Pages-деплоя в настройках репозитория
должен быть включён источник «GitHub Actions».

---

**© 2026 ENRG Protocol.** The protocol is governed. The protocol is not owned.
