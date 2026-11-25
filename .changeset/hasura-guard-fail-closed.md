---
'@golevelup/nestjs-hasura': patch
---

The Hasura webhook guard now rejects every request when the configured secret is empty or undefined, and compares the header with `crypto.timingSafeEqual`.
