import {
  AmqpConnection,
  RabbitMQModule,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { INestApplication, Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';

const testHandler = jest.fn();

const exchange = 'testSubscribeNoHandlerExhange';
const routingKey1 = 'testSubscribeNoHandlerRoute1';
const routingKey2 = 'testSubscribeNoHandlerRoute2';

@Injectable()
class SubscribeService {
  @RabbitSubscribe({
    exchange,
    routingKey: [routingKey1, routingKey2],
    queue: 'subscribeNoHandlerQueue',
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
          connectionInitOptions: { wait: true, reject: true, timeout: 3000 },
          registerHandlers: false,
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
      expect(testHandler).not.toHaveBeenCalled();
      done();
    }, 50);
  });
});
