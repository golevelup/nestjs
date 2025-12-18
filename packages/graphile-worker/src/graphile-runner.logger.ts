import { Logger } from '@nestjs/common';
import type { LogLevel } from 'graphile-worker';
import { Logger as GraphileLogger } from 'graphile-worker';

function graphileWorkerLogFactory(scope: unknown) {
  const logger = new Logger('GraphileWorker');

  return (level: LogLevel, message: string, meta?: unknown) => {
    const ctxObject: Record<string, unknown> = {};

    if (meta && Object.keys(meta).length > 0) {
      ctxObject.meta = meta;
    }

    if (scope && Object.keys(scope).length > 0) {
      ctxObject.scope = scope;
    }

    // If we don't have context, we can just log the message directly
    // e.g: graceful shutdown messages
    const logMessage = Object.keys(ctxObject).length
      ? { message, ...ctxObject }
      : message;

    switch (level) {
      case 'error':
        logger.error(logMessage);
        break;
      case 'warning':
        logger.warn(logMessage);
        break;
      case 'debug':
        logger.debug(logMessage);
        break;
      default:
        logger.log(logMessage);
        break;
    }
  };
}

export const RunnerLogger = new GraphileLogger(graphileWorkerLogFactory);
