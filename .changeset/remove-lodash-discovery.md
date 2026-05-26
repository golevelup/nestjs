---
"@golevelup/nestjs-discovery": patch
---

refactor(discovery): replace lodash with native JavaScript functions

Removed lodash as a dependency from the discovery package, replacing all usages with equivalent native JavaScript alternatives. This eliminates the last external runtime dependency in the package. Thanks to [@jdebarochez](https://github.com/jdebarochez) for this contribution!
