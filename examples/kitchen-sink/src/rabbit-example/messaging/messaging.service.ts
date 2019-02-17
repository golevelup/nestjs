import { RabbitRPC, RabbitSubscribe } from '@nestjs-plus/rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagingService {
  @RabbitRPC({
    exchange: 'exchange1',
    routingKey: 'rpc-route',
    queue: 'rpc-queue',
  })
  public async rpcHandler(msg: {}) {
    return {
      response: 42,
    };
  }

  @RabbitSubscribe({
    exchange: 'exchange1',
    routingKey: 'subscribe-route',
    queue: 'subscribe-queue',
  })
  public async pubSubHandler(msg: {}) {
    console.log(`Received message: ${JSON.stringify(msg)}`);
  }
}
