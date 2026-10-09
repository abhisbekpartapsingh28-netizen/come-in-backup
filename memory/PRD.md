# Come In — Grocery Delivery Web App

## Original Problem Statement
Restore the uploaded "Come In" project from its backup and resolve its incomplete state. The backup's frontend is an Expo/React Native mobile app, adapt it into the active React (CRACO) web environment. Finish the highest-priority user flow end to end (Home, Categories, Search, Product details, Cart, Delivery address). Preserve existing branding, content, and navigation. Phase 1 focuses on the primary shopping flow. Do NOT overwrite the existing backend code, `.env`, infrastructure or database.

## Architecture
- **Frontend**: React 19 + CRACO + plain CSS (no Tailwind utility classes in markup, custom CSS modules only). Shadcn UI available but Phase 1 uses the native design system. State is in-component with `localStorage` persistence for the cart and address.
- **Backend**: Untouched. FastAPI stub exposing default status endpoints only.
- **Data**: Local demo catalog in `/app/frontend/src/data/comeInCatalog.js` (18 products across 6 categories, 3 shops, 2 services).

## Core User Flows (All Implemented in Phase 1)
1. **Home** — hero, nearby shops carousel, categories carousel, 15-min quick delivery row, popular grid, home services, request-anything card.
2. **Categories** → category detail (products filtered by category).
3. **Product details** — large image, MRP strike-through savings, description, delivery perks, Add to cart / Go to cart, related products.
4. **Search** — live filter across name, brand and category with trending pills and category chips.
5. **Cart** — line items with quantity controls, remove, subtotal / delivery fee / total, free-delivery promo threshold ₹299, Proceed to checkout routes to the address form.
6. **Delivery address** — label (Home / Work / Other), name, 10-digit phone, address line, city, 6-digit pincode, instructions, saved to `localStorage`.
7. **Account** — delivery address card, orders / support / language placeholders.

## File Map (added or updated in this phase)
- `/app/frontend/src/App.js` — root shell, routing, cart state, localStorage.
- `/app/frontend/src/App.css` — full design system styles for every screen.
- `/app/frontend/src/data/comeInCatalog.js` — catalog, shops, services.
- `/app/frontend/src/components/ComeInProductCard.jsx` — reusable product card.
- `/app/frontend/src/screens/CategoriesScreen.jsx`
- `/app/frontend/src/screens/CategoryDetailScreen.jsx`
- `/app/frontend/src/screens/ProductDetailScreen.jsx`
- `/app/frontend/src/screens/CartScreen.jsx`
- `/app/frontend/src/screens/SearchScreen.jsx`
- `/app/frontend/src/screens/DeliveryAddressScreen.jsx`
- `/app/frontend/src/screens/AccountScreen.jsx`

## Branding
- Green (`#2f8f4e`), ink (`#173326`), paper (`#fffdf8`), yellow accent (`#f0c94d`) retained from the backup brand.
- Logo asset `src/assets/come-in-logo.svg` retained unchanged.

## Prioritized Backlog
### P0 — remaining in Phase 1
- None (primary shopping flow complete).

### P1 — Phase 2
- Persist cart + address to backend (new FastAPI endpoints + MongoDB models).
- Checkout success screen with order summary and tracking (currently "Proceed to checkout" routes to the address form).
- Real "Orders" screen in Account.
- Login / sign-up (currently anonymous device-only).

### P2 — Secondary features (from the original backup)
- Home services booking flow.
- Request-anything form.
- Language selection screen (i18n).
- Shop-detail / Shops-list screens.

## Known Mocks
- Catalog, shops, services are LOCAL DEMO DATA — intentional for Phase 1.
- Cart + address are device-local (`localStorage`) — no backend persistence.
- "Proceed to checkout" takes the user to the address form; no payment or order creation.

## Last Verified
- 2026-02-09: Phase 1 flows screenshot-verified on 1920×800 desktop and 390×844 mobile.
