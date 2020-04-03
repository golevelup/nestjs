import {
  RabbitRPC,
  MessageHandlerErrorBehavior,
} from '@golevelup/nestjs-rabbitmq';
import { Injectable, UseInterceptors } from '@nestjs/common';
import { TransformInterceptor } from '../transform.interceptor';
import { RpcException } from '@nestjs/microservices';

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
    errorBehavior: MessageHandlerErrorBehavior.REPLYERRORANDACK,
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
