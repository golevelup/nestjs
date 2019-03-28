import { AmqpConnection } from '@nestjs-plus/rabbitmq';
import { Controller, Get } from '@nestjs/common';

@Controller('messaging')
export class MessagingController {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  @Get('/rpc')
  public async getMessage() {
    const response = await this.amqpConnection.request(
      {
        exchange: 'exchange1',
        routingKey: 'rpc-route',
      },
      { request: 'request body' },
    );

    return response;
  }

  @Get('/pubsub')
  public async publishMessage() {
    await this.amqpConnection.publish('exchange2', 'subscribe-route', {
      message: 42,
    });
    return {
      result: 'Published message',
    };
  }
}
