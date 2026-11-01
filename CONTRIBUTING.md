# Contributing

AEGIS is the PayPal merchant. A payment made inside the PayPal app never reaches this code, and a pull request should not pretend that it does.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Leave the PayPal and xAI keys empty if you only need the practice merchant and the on-device mandate compiler.

## Branches

Work on `dev`. Open a short-lived `feat/<name>` branch, then a pull request back into `dev`. `main` moves when a release is cut.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `ci:`, `refactor:`, `style:`, `perf:`.

One logical change per commit. Name the issue in the body (`refs #12`). Add a `Signed-off-by` trailer. Do not commit `.env` or a database file.

## Checks

`npm test` covers the server and the web app. `npm run lint` and `npm run typecheck` should pass. `npm run e2e` runs the three demo payments in Chromium. GitHub Actions runs the same steps on `dev` and `main`.

The pre-commit hook typechecks the repo. Skip it only when you are mid-edit, and run the checks before you push.
