---
'@golevelup/ts-vitest': patch
---

Declare `vitest` as a peer dependency. The package imports `vitest` at runtime but didn't declare it, so package managers that isolate dependencies (pnpm) resolve whichever `vitest` happens to be hoisted. When that copy differs from the one running the tests, mocks come from a different Vitest instance and assertions break.
