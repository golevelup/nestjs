import {
  AmqpConnection,
  RabbitMQModule,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { INestApplication, Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { flatten, times } from 'lodash';

const testHandler = jest.fn();

const amqDefaultExchange = '';
const exchange = 'testSubscribeExhange';
const routingKey1 = 'testSubscribeRoute1';
const routingKey2 = 'testSubscribeRoute2';
const nonJsonRoutingKey = 'nonJsonSubscribeRoute';

const createRoutingKey = 'test.create.object';
const updateRoutingKey = 'test.update.object';
const deleteRoutingKey = 'test.delete.object';

const preExistingQueue = 'testing_queue_exists';
const nonExistingQueue = 'testing_queue_does_no_exist';

const createHandler = jest.fn();
const updateHandler = jest.fn();
const deleteHandler = jest.fn();

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
}

describe('Rabbit Subscribe', () => {
  let app: INestApplication;
  let amqpConnection: AmqpConnection;

  const rabbitHost = process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_HOST : 'localhost';
  const rabbitPort = process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_PORT : '5672';
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
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    amqpConnection = app.get<AmqpConnection>(AmqpConnection);
    await amqpConnection.channel.assertQueue(preExistingQueue);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should receive subscribe messages and handle them', async (done) => {
    [routingKey1, routingKey2, nonJsonRoutingKey].forEach((x, i) =>
      amqpConnection.publish(exchange, x, `testMessage-${i}`),
    );

    expect.assertions(4);

    setTimeout(() => {
      expect(testHandler).toHaveBeenCalledTimes(3);
      expect(testHandler).toHaveBeenCalledWith(`testMessage-0`);
      expect(testHandler).toHaveBeenCalledWith(`testMessage-1`);
      expect(testHandler).toHaveBeenCalledWith(`testMessage-2`);
      done();
    }, 50);
  });

  it('should work with a topic exchange set up that has multiple subscribers with similar routing keys', async (done) => {
    const routingKeys = [createRoutingKey, updateRoutingKey, deleteRoutingKey];

    const promises = flatten(
      routingKeys.map((key) => {
        return times(100).map((x) => amqpConnection.publish(exchange, key, x));
      }),
    );

    await Promise.all(promises);

    expect.assertions(303);

    setTimeout(() => {
      expect(createHandler).toHaveBeenCalledTimes(100);
      times(100).forEach((x) => expect(createHandler).toHaveBeenCalledWith(x));
      expect(updateHandler).toHaveBeenCalledTimes(100);
      times(100).forEach((x) => expect(updateHandler).toHaveBeenCalledWith(x));
      expect(deleteHandler).toHaveBeenCalledTimes(100);
      times(100).forEach((x) => expect(deleteHandler).toHaveBeenCalledWith(x));
      done();
    }, 150);
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

  it('should receive messages in existing queue without setting exchange and routing key on subscribe', async (done) => {
    // publish to the default exchange, using the queue as routing key
    const message1 = '{"key":"value 1"}';
    const message2 = '{"key":"value 2"}';
    const message3 = '{"key":"value 3"}';

    amqpConnection.publish(amqDefaultExchange, preExistingQueue, message1);
    amqpConnection.publish(amqDefaultExchange, preExistingQueue, message2);
    amqpConnection.publish(amqDefaultExchange, preExistingQueue, message3);

    // ASSERT
    expect.assertions(4);
    setTimeout(() => {
      expect(testHandler).toHaveBeenCalledTimes(3);
      expect(testHandler).toHaveBeenCalledWith(message1);
      expect(testHandler).toHaveBeenCalledWith(message2);
      expect(testHandler).toHaveBeenCalledWith(message3);
      done();
    }, 50);
  });

  it('should receive messages in new queue without setting exchange routing key on subscribe', async (done) => {
    const message = '{"key":"value"}';
    // publish to the default exchange, using the queue as routing key
    amqpConnection.publish(amqDefaultExchange, nonExistingQueue, message);

    // ASSERT
    expect.assertions(2);
    setTimeout(() => {
      expect(testHandler).toHaveBeenCalledTimes(1);
      expect(testHandler).toHaveBeenCalledWith(message);
      done();
    }, 50);
  });
});
