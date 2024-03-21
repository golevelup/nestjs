import {
  MessageHandlerErrorBehavior,
  RabbitRPC,
} from '@golevelup/nestjs-rabbitmq';
import { Injectable, UseInterceptors } from '@nestjs/common';
import { TransformInterceptor } from '../transform.interceptor';
import { ReplyErrorCallback } from './reply.error.callback';
import { RpcException } from './rpc-exception';

async function delay(milliseconds = 0, returnValue) {
  return new Promise((done) =>
    setTimeout(() => done(returnValue), milliseconds),
  );
}

@Injectable()
export class RpcService {
  @RabbitRPC({
    routingKey: 'rpc',
    exchange: 'exchange1',
    queue: 'rpc',
  })
  rpc(message: object) {
    return {
      echo: message,
    };
  }

  @RabbitRPC({
    routingKey: 'delay-rpc',
    exchange: 'exchange1',
    queue: 'delay-rpc',
  })
  async delayRpc(message: any) {
    await delay(message?.delay || 0, false);
    delete message.delay;
    return {
      echo: message,
    };
  }

  @UseInterceptors(TransformInterceptor)
  @RabbitRPC({
    routingKey: 'intercepted-rpc',
    exchange: 'exchange1',
    queue: 'intercepted-rpc',
  })
  interceptedRpc() {
    return {
      message: 42,
    };
  }

  @RabbitRPC({
    routingKey: 'error-reply-rpc',
    exchange: 'exchange1',
    queue: 'error-reply-rpc',
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: ReplyErrorCallback,
  })
  errorReplyRpc(message: object) {
    throw new RpcException(message);
  }

  @RabbitRPC({
    routingKey: 'non-json-rpc',
    exchange: 'exchange1',
    queue: 'non-json-rpc',
    allowNonJsonMessages: true,
  })
  nonJsonRpc(nonJsonMessage: any) {
    return {
      echo: nonJsonMessage,
    };
  }
}
