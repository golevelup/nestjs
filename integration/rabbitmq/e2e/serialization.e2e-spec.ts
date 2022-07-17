import {
  AmqpConnection,
  RabbitMQModule,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { INestApplication, Injectable, LoggerService } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { gzipSync, gunzipSync } from 'node:zlib';

const testHandler = jest.fn();

const exchange = 'testSerializationExchange';
const routingKey1 = 'testSerializationRoute1';
const routingKey2 = 'testSerializationRoute2';

@Injectable()
class SubscribeService {
  @RabbitSubscribe({
    exchange,
    routingKey: [routingKey1, routingKey2],
    queue: 'serializeQueue',
  })
  handleSubscribe(message: object) {
    testHandler(message);
  }
}

describe('Rabbit Subscribe', () => {
  let app: INestApplication;
  let amqpConnection: AmqpConnection;
  const customLogger = createMock<LoggerService>({
    warn: jest.fn(),
  });

  const rabbitHost =
    process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_HOST : 'localhost';
  const rabbitPort =
    process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_PORT : '5672';
  const uri = `amqp://rabbitmq:rabbitmq@${rabbitHost}:${rabbitPort}`;

  beforeAll(async () => {
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
          logger: customLogger,
          serializer: (value) => {
            return gzipSync(JSON.stringify(value));
          },
          deserializer: (message) => {
            return JSON.parse(gunzipSync(message).toString());
          },
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    amqpConnection = app.get<AmqpConnection>(AmqpConnection);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should receive subscribe messages and handle them', async () => {
    [routingKey1, routingKey2].forEach((x, i) =>
      amqpConnection.publish(exchange, x, `testMessage-${i}`),
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(testHandler).toHaveBeenCalledTimes(2);
    expect(testHandler).toHaveBeenCalledWith(`testMessage-0`);
    expect(testHandler).toHaveBeenCalledWith(`testMessage-1`);
  });
});
