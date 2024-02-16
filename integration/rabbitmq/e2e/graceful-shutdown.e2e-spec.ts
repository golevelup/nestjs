import {
  AmqpConnection,
  RabbitMQModule,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { INestApplication, Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';

const testHandler = jest.fn();

const routingKey1 = 'longConsumerRoutingKey';
let subscriberResolve: (value: unknown) => void;

async function delay(milliseconds = 0, returnValue) {
  return new Promise((done) =>
    setTimeout(() => done(returnValue), milliseconds),
  );
}

async function isFinished(promise) {
  return await Promise.race([
    delay(0, false),
    promise.then(
      () => true,
      () => true,
    ),
  ]);
}

@Injectable()
class SubscribeService {
  @RabbitSubscribe({
    queue: routingKey1,
  })
  async handleSubscribe(message: object) {
    await new Promise((resolve) => {
      subscriberResolve = resolve;
    });
    testHandler(message);
  }
}

describe('Rabbit Graceful Shutdown', () => {
  let app: INestApplication;
  let amqpConnection: AmqpConnection;

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
          uri,
          connectionInitOptions: { wait: true, reject: true, timeout: 3000 },
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableShutdownHooks();
    amqpConnection = app.get<AmqpConnection>(AmqpConnection);
    await app.init();
  });

  it('should wait for consumers to finish', async () => {
    await amqpConnection.publish('', routingKey1, 'testMessage');

    await new Promise((resolve) => setTimeout(resolve, 100));
    const closePromise = app.close();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(testHandler).not.toHaveBeenCalled();
    expect(await isFinished(closePromise)).toBeFalsy();
    subscriberResolve(true);
    await closePromise;
    expect(testHandler).toHaveBeenCalled();
  });
});
