---
'@golevelup/nestjs-rabbitmq': patch
---

`close()` now cancels the `@RabbitSubscribe`, batch and RPC consumers before it waits, waits for every message that was delivered (not only the ones in flight when it started), and no longer leaves an unhandled rejection when a message error handler throws (for example a `nack` on a closing channel).
