import { Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { interval } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { AmqpConnection } from './amqp/connection';
import { RabbitRPC, RabbitSubscribe } from './rabbitmq.decorators';
import { RabbitMQConfig } from './rabbitmq.interfaces';
import { RabbitMQModule } from './rabbitmq.module';

jest.mock('./amqp/connection');
const MockedAmqpConnection = AmqpConnection as jest.Mock<AmqpConnection>;

// let MockedAmqpConnection = (AmqpConnection as unknown) as jest.Mocked<
//   AmqpConnection
// >;

@Injectable()
class ExampleService {
  @RabbitRPC({
    routingKey: 'rpc',
    exchange: 'exchange1'
  })
  rpcMethod() {
    return;
  }

  @RabbitSubscribe({
    routingKey: 'subscribe',
    exchange: 'exchange2'
  })
  subscribeMethod() {
    return;
  }
}

@Module({
  providers: [ExampleService]
})
class ExampleModule {}

function correctAmqpConnection(config: RabbitMQConfig) {
  expect(AmqpConnection).toBeCalledTimes(1);
  expect(AmqpConnection).toBeCalledWith(config);

  const amqpConnection = MockedAmqpConnection.mock.instances[0] as jest.Mocked<
    AmqpConnection
  >;

  expect(amqpConnection.init).toBeCalledTimes(1);
}

describe('RabbitMQ', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  let app: TestingModule;
  let amqpMock: AmqpConnection;
  let config: RabbitMQConfig;

  describe('Module configuration', () => {
    describe('forRoot', () => {
      beforeAll(async () => {
        config = {
          uri: 'fakeuri'
        };

        app = await Test.createTestingModule({
          imports: [
            ExampleModule,
            RabbitMQModule.forRoot(RabbitMQModule, config)
          ]
        }).compile();

        await app.init();
      });

      it('correctly configures the AmqpConnection', () => {
        correctAmqpConnection(config);
      });
    });

    describe('forRootAsync', () => {
      beforeAll(async () => {
        config = {
          uri: 'fakeuri'
        };

        app = await Test.createTestingModule({
          imports: [
            ExampleModule,
            RabbitMQModule.forRootAsync(RabbitMQModule, {
              useFactory: () => {
                return interval(100)
                  .pipe(
                    map(() => config),
                    first()
                  )
                  .toPromise();
              }
            })
          ]
        }).compile();

        await app.init();
      });

      it('correctly configures the AmqpConnection', () => {
        correctAmqpConnection(config);

        // console.log(MockedAmqpConnection);
        // expect(MockedAmqpConnection.init.mock).toBeCalledTimes(1);
      });
    });
  });

  describe('Attaching Handlers', () => {
    beforeEach(async () => {
      amqpMock = new AmqpConnection({
        uri: '',
        exchanges: []
      });

      app = await Test.createTestingModule({
        imports: [ExampleModule, RabbitMQModule.attach(amqpMock)]
      }).compile();

      await app.init();
    });

    it('should register rabbit rpc handlers', async () => {
      expect(amqpMock.createRpc).toBeCalledTimes(1);

      expect(amqpMock.createRpc).toBeCalledWith(
        expect.any(Function),
        expect.objectContaining({
          exchange: 'exchange1',
          routingKey: 'rpc'
        })
      );
    });

    it('should register rabbit subscribe handlers', async () => {
      expect(amqpMock.createSubscriber).toBeCalledTimes(1);

      expect(amqpMock.createSubscriber).toBeCalledWith(
        expect.any(Function),
        expect.objectContaining({
          exchange: 'exchange2',
          routingKey: 'subscribe'
        })
      );
    });
  });
});
