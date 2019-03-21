import { Get, Controller } from '@nestjs/common';
import { AmqpConnection } from '@nestjs-plus/rabbitmq';

@Controller()
export class AppController {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('rpc')
  async getRpc() {
    const response = await this.amqpConnection.request(
      {
        exchange: 'exchange1',
        routingKey: 'rpc',
      },
      {},
    );

    return response;
  }
}
