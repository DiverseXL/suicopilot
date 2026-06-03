# diversexl-suicopilot

A monorepo for the `suicopilot` project, combining a Sui-powered backend service and a Next.js frontend app.

## Project structure

- `apps/backend/` – Express + TypeScript backend service
  - `src/` – backend source files and route definitions
  - `data/` – persistence artifacts such as blob IDs
  - `config/` – environment configuration
  - `services/` – domain services and integrations
- `apps/frontend/` – Next.js frontend application
  - `app/` – Next.js app routes and pages
  - `components/` – reusable UI components
  - `hooks/` – frontend hooks
  - `lib/` – frontend utilities and API client
- `packages/shared/` – shared library code for the workspace
- `THESIS.md` / `THESIS_INTEGRATION.md` – project research and integration notes

## Prerequisites

- Node.js (recommended version compatible with `pnpm` and Next.js 16)
- `pnpm` package manager
- `pnpm` v11.x is recommended based on workspace config

## Setup

1. Install dependencies from the repository root:
   ```bash
   pnpm install
   ```

2. Configure environment variables for backend:
   - Copy or create `apps/backend/.env`
   - Add required values such as `OPENAI_API_KEY`, `SUI_RPC_URL`, `PORT`, `SUI_NETWORK`, and Tatum/Walrus endpoints

3. Run the backend in development mode:
   ```bash
   pnpm --dir apps/backend dev
   ```

4. Run the frontend in development mode:
   ```bash
   pnpm --dir apps/frontend dev
   ```

## Backend details

The backend service uses:
- Express
- TypeScript
- OpenAI API
- Sui integrations via `@mysten/sui` and `@mysten/walrus`
- `better-sqlite3` for local data storage
- `node-cron` for scheduled tasks

## Frontend details

The frontend is a React + Next.js app using:
- `next` 16
- React 19
- Tailwind CSS via `@tailwindcss/postcss`
- Sui wallet integration via `@mysten/dapp-kit`
- `axios` for API calls

## Useful commands

From the repository root:
- `pnpm --dir apps/backend dev` — start backend in dev mode
- `pnpm --dir apps/backend build` — build backend
- `pnpm --dir apps/backend start` — run production backend bundle
- `pnpm --dir apps/frontend dev` — start frontend in dev mode
- `pnpm --dir apps/frontend build` — build frontend
- `pnpm --dir apps/frontend start` — start frontend production server

## Notes

- This repo is organized as a pnpm workspace.
- `apps/backend` and `apps/frontend` each have their own package manifest.
- The root `package.json` primarily defines workspace-level engine requirements.
