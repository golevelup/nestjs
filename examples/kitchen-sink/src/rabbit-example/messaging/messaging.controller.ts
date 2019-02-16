import { AmqpConnection } from '@nestjs-plus/rabbitmq/lib/amqp/AmqpConnection';
import { Controller, Get } from '@nestjs/common';

@Controller('messaging')
export class MessagingController {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  @Get('/')
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
}
