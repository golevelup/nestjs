import {
  AmqpConnection,
  RabbitMQModule,
  RabbitSubscribe,
  MessageSerializer,
  MessageDeserializer,
} from '@golevelup/nestjs-rabbitmq';
import { INestApplication, Injectable, LoggerService } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { gzipSync, gunzipSync } from 'node:zlib';

const moduleSerializeHandler = jest.fn();
const handlerSerializeHandler = jest.fn();

const moduleSerializer: MessageSerializer = jest.fn((value) =>
  gzipSync(JSON.stringify(value)),
);
const moduleDeserializer: MessageDeserializer = jest.fn((message) =>
  JSON.parse(gunzipSync(message).toString()),
);

const handlerDeserializer: MessageDeserializer = jest.fn((message) =>
  JSON.parse(gunzipSync(message).toString()),
);

const exchange = 'testSerializationExchange';
const routingKey1 = 'testSerializationRoute1';
const routingKey2 = 'testSerializationRoute2';
const routingKey3 = 'testSerializationRoute3';
const routingKey4 = 'testSerializationRoute4';

@Injectable()
class SubscribeModuleSerializationService {
  @RabbitSubscribe({
    exchange,
    routingKey: [routingKey1, routingKey2],
    queue: 'moduleSerializeQueue',
  })
  handleSubscribe(message: object) {
    moduleSerializeHandler(message);
  }
}

@Injectable()
class SubscribeHandlerSerializationService {
  @RabbitSubscribe({
    exchange,
    routingKey: [routingKey3, routingKey4],
    queue: 'handlerSerializeQueue',
    deserializer: handlerDeserializer,
  })
  handleSubscribe(message: object) {
    handlerSerializeHandler(message);
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

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture = await Test.createTestingModule({
      providers: [
        SubscribeModuleSerializationService,
        SubscribeHandlerSerializationService,
      ],
      imports: [
        RabbitMQModule.forRoot({
          exchanges: [
            {
              name: exchange,
              type: 'topic',
            },
          ],
          uri,
          connectionInitOptions: { wait: true, reject: true, timeout: 3000 },
          logger: customLogger,
          serializer: moduleSerializer,
          deserializer: moduleDeserializer,
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

  it('should receive subscribe messages and serialize/deserialize them via module options', async () => {
    [routingKey1, routingKey2].forEach((x, i) =>
      amqpConnection.publish(exchange, x, `testMessage-${i}`),
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(moduleSerializeHandler).toHaveBeenCalledTimes(2);
    expect(moduleSerializeHandler).toHaveBeenCalledWith(`testMessage-0`);
    expect(moduleSerializeHandler).toHaveBeenCalledWith(`testMessage-1`);
    expect(moduleDeserializer).toHaveBeenCalledTimes(2);
    expect(moduleSerializer).toHaveBeenCalledTimes(2);
    expect(handlerDeserializer).not.toBeCalled();
  });

  it('should receive subscribe messages and deserialize via handler options', async () => {
    [routingKey3, routingKey4].forEach((x, i) =>
      amqpConnection.publish(exchange, x, `testMessage-${i}`),
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(handlerSerializeHandler).toHaveBeenCalledTimes(2);
    expect(handlerSerializeHandler).toHaveBeenCalledWith(`testMessage-0`);
    expect(handlerSerializeHandler).toHaveBeenCalledWith(`testMessage-1`);
    expect(handlerDeserializer).toHaveBeenCalledTimes(2);
    expect(moduleDeserializer).not.toBeCalled();
    expect(moduleSerializer).toHaveBeenCalledTimes(2);
  });
});
