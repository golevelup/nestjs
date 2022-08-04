import {
  AmqpConnection,
  RabbitMQModule,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { INestApplication, Injectable, LoggerService } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { flatten, times } from 'lodash';
import { createMock } from '@golevelup/ts-jest';

const testHandler = jest.fn();

const amqDefaultExchange = '';
const exchange = 'testSubscribeExchange';
const routingKey1 = 'testSubscribeRoute1';
const routingKey2 = 'testSubscribeRoute2';
const routingKey3 = 'testSubscribeViaHandlerRoute';
const nonJsonRoutingKey = 'nonJsonSubscribeRoute';

const createRoutingKey = 'test.create.object';
const updateRoutingKey = 'test.update.object';
const deleteRoutingKey = 'test.delete.object';

const preExistingQueue = 'testing_queue_exists';
const nonExistingQueue = 'testing_queue_does_no_exist';

const createHandler = jest.fn();
const updateHandler = jest.fn();
const deleteHandler = jest.fn();

const FANOUT = 'fanout';
const fanoutHandler = jest.fn();

@Injectable()
class SubscribeService {
  @RabbitSubscribe({
    name: 'handler1',
  })
  handleSubscribeByName(message: object) {
    testHandler(message);
  }

  @RabbitSubscribe({
    exchange,
    routingKey: [routingKey1, routingKey2],
    queue: 'subscribeQueue',
  })
  handleSubscribe(message: object) {
    testHandler(message);
  }

  @RabbitSubscribe({
    queue: preExistingQueue,
    createQueueIfNotExists: false,
  })
  handleExistingQueueSubscribe(message: object) {
    testHandler(message);
  }

  @RabbitSubscribe({
    queue: nonExistingQueue,
    createQueueIfNotExists: true,
  })
  handleNonExistingQueueSubscribe(message: object) {
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

  @RabbitSubscribe({
    exchange,
    routingKey: [createRoutingKey],
    queue: 'create',
    allowNonJsonMessages: true,
  })
  create(message: any) {
    createHandler(message);
  }

  @RabbitSubscribe({
    exchange,
    routingKey: [updateRoutingKey],
    queue: 'update',
    allowNonJsonMessages: true,
  })
  update(message: any) {
    updateHandler(message);
  }

  @RabbitSubscribe({
    exchange,
    routingKey: [deleteRoutingKey],
    queue: 'delete',
    allowNonJsonMessages: true,
  })
  delete(message: any) {
    deleteHandler(message);
  }

  @RabbitSubscribe({ exchange: FANOUT, routingKey: '' })
  emptyRoutingKey(message: any) {
    fanoutHandler(message);
  }

  @RabbitSubscribe({
    exchange,
    routingKey: 'infinite-loop',
  })
  subscriberThatReturns() {
    return Promise.resolve(true);
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
            {
              name: FANOUT,
              type: FANOUT,
            },
          ],
          handlers: {
            handler1: {
              exchange,
              routingKey: [routingKey3],
            },
          },
          uri,
          connectionInitOptions: { wait: true, reject: true, timeout: 3000 },
          logger: customLogger,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    amqpConnection = app.get<AmqpConnection>(AmqpConnection);
    await amqpConnection.channel.assertQueue(preExistingQueue);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should receive subscribe messages and handle them', async () => {
    [routingKey1, routingKey2, nonJsonRoutingKey].forEach((x, i) =>
      amqpConnection.publish(exchange, x, `testMessage-${i}`),
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(testHandler).toHaveBeenCalledTimes(3);
    expect(testHandler).toHaveBeenCalledWith(`testMessage-0`);
    expect(testHandler).toHaveBeenCalledWith(`testMessage-1`);
    expect(testHandler).toHaveBeenCalledWith(`testMessage-2`);
  });

  it('should receive messages when subscribed via handler name', async () => {
    amqpConnection.publish(exchange, routingKey3, 'testMessage');

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(testHandler).toHaveBeenCalledTimes(1);
    expect(testHandler).toHaveBeenCalledWith(`testMessage`);
  });

  it('should work with a topic exchange set up that has multiple subscribers with similar routing keys', async () => {
    const routingKeys = [createRoutingKey, updateRoutingKey, deleteRoutingKey];

    const promises = flatten(
      routingKeys.map((key) => {
        return times(100).map((x) => amqpConnection.publish(exchange, key, x));
      }),
    );

    await Promise.all(promises);
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(createHandler).toHaveBeenCalledTimes(100);
    times(100).forEach((x) => expect(createHandler).toHaveBeenCalledWith(x));
    expect(updateHandler).toHaveBeenCalledTimes(100);
    times(100).forEach((x) => expect(updateHandler).toHaveBeenCalledWith(x));
    expect(deleteHandler).toHaveBeenCalledTimes(100);
    times(100).forEach((x) => expect(deleteHandler).toHaveBeenCalledWith(x));
  });

  it('should receive undefined argument when subscriber allows non-json messages and message is invalid', async () => {
    amqpConnection.publish(exchange, nonJsonRoutingKey, undefined);
    amqpConnection.publish(exchange, nonJsonRoutingKey, Buffer.alloc(0));
    amqpConnection.publish(exchange, nonJsonRoutingKey, Buffer.from('{a:'));

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(testHandler).toHaveBeenCalledTimes(3);
    expect(testHandler).toHaveBeenNthCalledWith(1, undefined);
    expect(testHandler).toHaveBeenNthCalledWith(2, undefined);
    expect(testHandler).toHaveBeenNthCalledWith(3, undefined);
  });

  it('should receive messages in existing queue without setting exchange and routing key on subscribe', async () => {
    // publish to the default exchange, using the queue as routing key
    const message1 = '{"key":"value 1"}';
    const message2 = '{"key":"value 2"}';
    const message3 = '{"key":"value 3"}';

    amqpConnection.publish(amqDefaultExchange, preExistingQueue, message1);
    amqpConnection.publish(amqDefaultExchange, preExistingQueue, message2);
    amqpConnection.publish(amqDefaultExchange, preExistingQueue, message3);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(testHandler).toHaveBeenCalledTimes(3);
    expect(testHandler).toHaveBeenCalledWith(message1);
    expect(testHandler).toHaveBeenCalledWith(message2);
    expect(testHandler).toHaveBeenCalledWith(message3);
  });

  it('should receive messages in new queue without setting exchange routing key on subscribe', async () => {
    const message = '{"key":"value"}';
    // publish to the default exchange, using the queue as routing key
    amqpConnection.publish(amqDefaultExchange, nonExistingQueue, message);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(testHandler).toHaveBeenCalledTimes(1);
    expect(testHandler).toHaveBeenCalledWith(message);
  });

  it('should route messages to fanout exchange handlers with no routing key', async () => {
    const message = { message: 'message' };
    amqpConnection.publish(FANOUT, '', message);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(fanoutHandler).toHaveBeenCalledTimes(1);
    expect(fanoutHandler).toHaveBeenCalledWith(message);
  });

  it('should go into infite lopo', async () => {
    const message = '{"key":"value"}';
    // tslint:disable-next-line:no-console
    // publish and expect to acknowledge but not throw
    const warnSpy = jest.spyOn(customLogger, 'warn');
    amqpConnection.publish(exchange, 'infinite-loop', message);
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Subscribe handlers should only return void'),
    );
  });
});
