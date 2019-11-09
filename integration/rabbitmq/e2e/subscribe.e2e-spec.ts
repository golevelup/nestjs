import {
  AmqpConnection,
  RabbitMQModule,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { INestApplication, Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';

const testHandler = jest.fn();

const exchange = 'testSubscribeExhange';
const routingKey = 'testSubscribeRoute';
const testMessage = {
  messageProp: 42,
};

@Injectable()
class SubscribeService {
  @RabbitSubscribe({
    exchange,
    routingKey,
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
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    amqpConnection = app.get<AmqpConnection>(AmqpConnection);
    await app.init();
  });

  it('should receive subscribe messages and handle them', async done => {
    amqpConnection.publish(exchange, routingKey, testMessage);

    setTimeout(() => {
      expect(testHandler).toHaveBeenCalledTimes(1);
      expect(testHandler).toHaveBeenCalledWith(testMessage);
      done();
    }, 50);
  });
});
