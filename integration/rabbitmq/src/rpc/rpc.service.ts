import { Injectable } from '@nestjs/common';
import { RabbitRPC } from '@nestjs-plus/rabbitmq';
import { UseInterceptors } from '@nestjs/common';
import { TransformInterceptor } from '../transform.interceptor';

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
  interceptedRpc(message: {}) {
    return {
      message: 42,
    };
  }
}
