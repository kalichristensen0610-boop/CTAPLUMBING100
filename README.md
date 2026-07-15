# CTA Plumbing 100 Website

A conversion-focused Next.js website for CTA Plumbing 100, serving Nampa and Idaho's Treasure Valley.

## Local development

1. Install Node.js 22 and enable Corepack: `corepack enable`.
2. Install dependencies: `pnpm install`.
3. Copy `.env.example` to `.env.local` and replace the placeholder public details.
4. Start the site: `pnpm dev`.
5. Open `http://localhost:3000`.

Without SMTP settings, valid form submissions return a safe development-only confirmation and are not retained or delivered.

## Business configuration

Public phone, email, hours, service area, navigation, and city lists are centralized in `src/lib/site.ts`. Environment variables override the public contact placeholders. Service and location copy lives in `src/lib/content.ts`.

Before launch, replace the placeholder values for:

- Public domain, phone, email, and business hours
- SMTP sender and lead-recipient settings
- Verified business address, if it should be public
- Map or Google Business Profile link
- Verified customer reviews, with permission to publish

Do not add license status, ratings, warranties, or other business claims until they are verified. The owner has confirmed 24/7 emergency plumbing availability.

## Forms and email

The `/api/leads` endpoint validates service requests, limits request size, rate limits repeated requests, includes a honeypot field, and sends email through SMTP. The `/api/employment` endpoint validates application fields and PDF, DOC, or DOCX resume uploads up to 5 MB. Configure the variables documented in `.env.example`.

In production, missing SMTP settings return an unavailable response and direct the visitor to call. Submitted details are never written to logs.

## Quality checks

```text
pnpm typecheck
pnpm lint
pnpm build
```

## Docker production build

```text
docker compose build
docker compose up -d
```

The image uses a multi-stage Node Alpine build and Next.js standalone output. Supply production environment values through `.env` or your hosting platform's secret manager.
