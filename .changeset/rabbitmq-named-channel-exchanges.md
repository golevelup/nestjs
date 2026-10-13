---
'@golevelup/nestjs-rabbitmq': patch
---

Assert the configured exchanges on named channels too, so a subscriber on a named channel no longer binds its queue before the exchange exists after a reconnect (a `404 NOT_FOUND` that drops the connection in a loop).
