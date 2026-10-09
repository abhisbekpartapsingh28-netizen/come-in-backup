# Come In — Product Requirements Document (restored from backup)

## Original Problem Statement
> "I have attached my existing Come In project ZIP backup. I do NOT want to build a new app from scratch.
> Please inspect the uploaded ZIP file, extract and identify the existing project structure, and restore the existing application from its source code. Preserve all existing features, UI, branding, frontend, backend, API integrations, and configuration files wherever possible... My goal is to continue working on the SAME Come In app from this backup in this Emergent account."

Follow-up Master Prompt (user) outlined 13 upgrade phases to be executed on top of the restored codebase.

## Restoration Summary (Jan 2026)
- Extracted `come-in-backup2-conflict_091026_1401.zip` under `/app/come-in-backup/...`.
- Verified it is an Expo (React Native Web, SDK 57) app with FastAPI backend scaffold.
- Archived the previous CRA placeholder app at `/app/.pre-restore-archive/` (not deleted).
- Replaced `/app/frontend` with the backup frontend and `/app/backend` with the backup backend.
- Preserved protected env variables unchanged:
  - `/app/frontend/.env` → `REACT_APP_BACKEND_URL`, `WDS_SOCKET_PORT`, `ENABLE_HEALTH_CHECK`
  - `/app/backend/.env` → `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`
- Adjusted `package.json` `start` script to `expo start --web --port 3000` so supervisor can serve the web build on port 3000 behind the Emergent ingress (`/api` → 8001, `/` → 3000).
- Supervisor status: backend + frontend + mongodb RUNNING.
- Live preview verified at the production preview URL — Come In homepage, categories grid, bottom tab navigation (Home / Categories / Search / Cart / Account) rendering correctly on both desktop (1920×800) and mobile (390×844).

## Tech Stack (as restored)
- Frontend: Expo SDK 57, expo-router (file-based routing in `/app/frontend/app/`), React Native Web, TypeScript, @tanstack/react-query, React Native Reanimated, @react-native-vector-icons/feather.
- Backend: FastAPI + Motor (MongoDB) scaffold (`/app/backend/server.py`) — currently only `/api/status` endpoints; business endpoints to be built in later phases.
- Local data: `src/data/shops.ts`, `src/data/catalog.ts` (seed data), `src/store/cart.tsx`, `src/store/location.tsx`, i18n in `src/i18n/`.

## Core Requirements (static)
Deliver a doorstep marketplace that bridges online delivery shops and local offline shops. Users browse shops/categories, add items to cart, place orders, and can "Request Anything" when an item is unlisted. English/Hindi language toggle. Shopkeepers register, manage profile & catalog. Agent-assisted phone/WhatsApp fallback for discovery/support.

## User Personas
- Shopper (consumer): browses, filters by online/offline, orders, requests items, pays COD/online.
- Shopkeeper: registers, manages shop profile and product catalog, receives orders.
- Agent / Admin: approves shops, handles assistance requests, operational dashboard.

## What's Been Implemented
- 2026-01-09 — Restoration from backup ZIP. Expo app live on preview URL with existing UI, branding, i18n context, cart & location stores, seed catalog, bottom tab navigation.

## Prioritized Backlog (from user's 13-Phase Master Prompt)
- **P1 Phase 1** — Audit & repair existing buttons, routes, navigation, shopping flow end-to-end.
- **P1 Phase 2** — Finish English/Hindi language support (persistence + full translation coverage).
- **P1 Phase 3** — Online vs Offline shop catalog filtering logic.
- **P2 Phase 4** — Shopkeeper registration + shop profile management.
- **P2 Phase 5** — Phone call (tel:) + WhatsApp links + Come In Agent assistance fallback.
- **P2 Phase 6** — "Request Anything" form for unlisted items.
- **P3 Phase 7** — Product & catalog management (shopkeeper side).
- **P3 Phase 8** — Cart, checkout, delivery address, order creation.
- **P3 Phase 9** — Payments (Stripe test key via Emergent + COD).
- **P3 Phase 10** — Customer account, profile setup, order history.
- **P3 Phase 11** — Admin / operational dashboard (approvals, requests).
- **P4 Phase 12** — Design & responsiveness polish (preserve Come In brand).
- **P4 Phase 13** — Final end-to-end test sweep.

## Notes for Next Agent
- Pre-restore archive lives at `/app/.pre-restore-archive/` — safe to delete once user confirms, but keep until explicit sign-off.
- The DevTools error in frontend logs ("Running as root without --no-sandbox is not supported") is from Expo attempting to launch Electron-based React Native DevTools; harmless for the web preview — Metro still serves on port 3000.
- No frontend `.env` keys are consumed by the Expo app code today (`REACT_APP_BACKEND_URL` is retained for future API calls once backend endpoints are built in later phases; prefer `EXPO_PUBLIC_BACKEND_URL` going forward if you want runtime access from the Expo client, or wire `REACT_APP_BACKEND_URL` through `react-native-dotenv` babel plugin).
