import { ExecutionContext } from '@nestjs/common';
import { RABBIT_HANDLER } from './rabbitmq.constants';

export const isRabbitContext = (executionContext: ExecutionContext) => {
  const handler = executionContext.getHandler();
  return Reflect.getMetadataKeys(handler).includes(RABBIT_HANDLER);
};
