import { Controller, Get } from '@nestjs/common';

import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Controller()
export class AppController {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('rpc')
  async getRpc() {
    return this.amqpConnection.request({
      exchange: 'exchange1',
      routingKey: 'rpc',
    });
  }
}
