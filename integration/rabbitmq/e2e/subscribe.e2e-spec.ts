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
          connectionInit: { wait: true, reject: true },
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    amqpConnection = app.get<AmqpConnection>(AmqpConnection);
    await app.init();
  });

  it('should receive subscribe messages and handle them', async done => {
    [routingKey1, routingKey2].forEach((x, i) =>
      amqpConnection.publish(exchange, x, `testMessage-${i}`),
    );

    setTimeout(() => {
      expect(testHandler).toHaveBeenCalledTimes(2);
      expect(testHandler).toHaveBeenCalledWith(`testMessage-0`);
      expect(testHandler).toHaveBeenCalledWith(`testMessage-1`);
      done();
    }, 50);
  });
});
