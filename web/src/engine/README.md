# Browser risk engine

A verbatim copy of `server/src/risk`, the rule compiler, and report builders, used by
the landing-page risk demo and by `VITE_DEMO_MODE` (GitHub Pages). `engine.test.ts`
asserts the browser copy returns the same decisions as the server for the demo cases.
