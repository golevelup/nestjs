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
  let amqpMock: AmqpConnection;

  beforeEach(async () => {
    // amqpMock = jest.fn<Partial<AmqpConnection>, []>(() => {
    //   return {
    //     createRpc: jest.fn()
    //   };
    // });

    // const something = new amqpMock();

    app = await Test.createTestingModule({
      imports: [RabbitMQModule, ExampleModule]
    })
      .overrideProvider(AmqpConnection)
      .useValue({
        createRpc: jest.fn()
      })
      .compile();

    await app.init();
    amqpMock = app.get<AmqpConnection>(AmqpConnection);
  });

  it('should register rabbit handlers', async () => {
    expect(amqpMock.createRpc).toBeCalled();
  });
});
