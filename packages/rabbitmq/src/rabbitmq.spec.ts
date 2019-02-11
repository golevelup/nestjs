import { Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AmqpConnection } from './amqp/AmqpConnection';
import { RabbitRPC } from './rabbitmq.decorators';
import { RabbitMQModule } from './rabbitmq.module';

@Injectable()
class ExampleService {
  @RabbitRPC({
    routingKey: 'testRoute',
    exchange: 'testExchange'
  })
  rabbitMethod() {}
}

@Module({
  providers: [ExampleService]
})
class ExampleModule {}

describe('RabbitMQ', () => {
  let app: TestingModule;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [RabbitMQModule, ExampleModule]
    })
      .overrideProvider(AmqpConnection)
      .useValue({})
      .compile();

    await app.init();
  });

  it('should register rabbit handlers', async () => {});
});
