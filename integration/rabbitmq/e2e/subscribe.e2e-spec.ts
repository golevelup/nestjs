import {
  AmqpConnection,
  RabbitMQModule,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { INestApplication, Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';

const testHandler = jest.fn();

const exchange = 'testSubscribeExhange';
const routingKey1 = 'testSubscribeRoute1';
const routingKey2 = 'testSubscribeRoute2';
const nonJsonRoutingKey = 'nonJsonSubscribeRoute';

@Injectable()
class SubscribeService {
  @RabbitSubscribe({
    exchange,
    routingKey: [routingKey1, routingKey2],
    queue: 'subscribeQueue',
  })
  handleSubscribe(message: object) {
    testHandler(message);
  }

  @RabbitSubscribe({
    exchange,
    routingKey: [nonJsonRoutingKey],
    queue: 'subscribeQueue',
    allowNonJsonMessages: true,
  })
  nonJsonHandleSubscribe(message: any) {
    testHandler(message);
  }
}

describe('Rabbit Subscribe', () => {
  let app: INestApplication;
  let amqpConnection: AmqpConnection;

  const rabbitHost = process.env.NODE_ENV === 'ci' ? 'rabbit' : 'localhost';
  const uri = `amqp://rabbitmq:rabbitmq@${rabbitHost}:5672`;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      providers: [SubscribeService],
      imports: [
        RabbitMQModule.forRoot(RabbitMQModule, {
          exchanges: [
            {
              name: exchange,
              type: 'topic',
            },
          ],
          uri,
          connectionInitOptions: { wait: true, reject: true, timeout: 3000 },
        }),
      ],
    }).compile();

    jest.resetAllMocks();

    app = moduleFixture.createNestApplication();
    amqpConnection = app.get<AmqpConnection>(AmqpConnection);
    await app.init();
  });

  it('should receive subscribe messages and handle them', async (done) => {
    [routingKey1, routingKey2, nonJsonRoutingKey].forEach((x, i) =>
      amqpConnection.publish(exchange, x, `testMessage-${i}`),
    );

    setTimeout(() => {
      expect(testHandler).toHaveBeenCalledTimes(3);
      expect(testHandler).toHaveBeenCalledWith(`testMessage-0`);
      expect(testHandler).toHaveBeenCalledWith(`testMessage-1`);
      expect(testHandler).toHaveBeenCalledWith(`testMessage-2`);
      done();
    }, 50);
  });

  it('should receive undefined argument when subscriber allows non-json messages and message is invalid', async (done) => {
    amqpConnection.publish(exchange, nonJsonRoutingKey, undefined);
    amqpConnection.publish(exchange, nonJsonRoutingKey, Buffer.alloc(0));
    amqpConnection.publish(exchange, nonJsonRoutingKey, Buffer.from('{a:'));

    setTimeout(() => {
      expect(testHandler).toHaveBeenCalledTimes(3);
      expect(testHandler).toHaveBeenNthCalledWith(1, undefined);
      expect(testHandler).toHaveBeenNthCalledWith(2, undefined);
      expect(testHandler).toHaveBeenNthCalledWith(3, undefined);
      done();
    }, 50);
  });
});
