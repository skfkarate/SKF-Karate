# SKF Karate Website

Next.js 16 website for SKF Karate with:
- public marketing pages
- athlete search and profile pages
- results and events pages
- admin-only athlete and tournament management
- JSON-backed local data storage for development and lightweight deployments

## Commands

```bash
npm run dev
npm run build
npm run start
```

## Project Structure

```text
app/
  _components/         shared and feature UI used by routes
  admin/               admin routes
  api/                 route handlers
  ...                  public app routes

lib/
  data/                compatibility facades for domain data access
  server/
    auth/              NextAuth options and session guards
    repositories/      server-owned athlete, tournament, and event data logic
    validation/        request validation
    api.js             API helpers and error handling
    data-store.js      JSON file persistence helpers
  types/               shared domain constants and labels
  utils/               domain utilities used by app and repositories

public/                static assets
proxy.js               admin route protection
```

## Structure Rules

- Keep route entry files in `app/**/page.js`, `layout.js`, and `route.js` thin.
- Put reusable UI in `app/_components`, grouped by domain when possible.
- Keep server-only business logic in `lib/server/**`.
- Treat `lib/data/*.js` as stable public entrypoints that forward to `lib/server/repositories/*`.
- Do not make server helpers import from `app/api/**`; API routes should depend on server modules, not the other way around.

## Data Storage

By default, mutable athlete, event, and tournament data is written under:

```text
.data/
```

You can override that location with:

```bash
SKF_DATA_DIR=/path/to/data
```

## Auth Environment

Admin auth uses NextAuth credentials and expects environment variables such as:

```bash
NEXTAUTH_SECRET=
ADMIN_USERNAME=
ADMIN_PASSWORD=
INSTRUCTOR_USERNAME=
INSTRUCTOR_PASSWORD=
```

The contact form integrations also rely on the Google Sheets and Telegram environment variables already referenced in `app/api/contact/route.js`.
