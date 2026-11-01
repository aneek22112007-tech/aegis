# Changelog

## Unreleased

- A 3D landing page opens at `/`. Margaret's home moves to `/senior`.
- Guardian and the Lure Log use a dashboard with KPIs, a risk chart, and dark and light themes.
- The GitHub Pages build runs the full demo in the browser with a copy of the risk engine.
- A Dockerfile and `render.yaml` run the server and the web build together.
- GitHub Pages publishes the screens. The payment server still starts with `npm run dev`.

## 1.0.0

- GitHub Actions runs lint, the typecheck, the unit tests, and the three browser demos.
- The README covers the sandbox app, the buyer account, the ngrok webhook, and the demo script.
- Screenshots of the home screen, the demo, Priya's alert, and the Lure Log are in `docs/`.

## 0.2.0

- PayPal orders are created with intent AUTHORIZE. Low risk captures, medium risk holds for the guardian, and high risk voids before capture.
- A missing PayPal login uses an in-process practice merchant, so the three demo payments still decide.
- Priya sees a live alert, then approves or denies. A held payment voids once when the window ends.
- Margaret's screens use large type, plain language, and read-aloud. The Lure Log exports CSV and an FTC-style draft.

## 0.1.0

- The server and web app build as npm workspaces.
- SQLite stores Margaret, Priya, a versioned mandate, trusted payees, and payment history.
- Plain-language wishes compile through Grok, with one retry and an on-device fallback.
- The risk engine scores a payment as low, medium, or high. The three demo cases land on those three bands.
