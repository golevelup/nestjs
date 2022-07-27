import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { INestApplication, LoggerService } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

const exchange = 'testCancelAndResumeExchange';
const queue = 'testCancelAndResumeQueue';
const routingKey1 = 'testCancelAndResumeRoute1';

describe('Rabbit Cancel and Resume', () => {
  const customLogger = createMock<LoggerService>({
    warn: jest.fn(),
  });

  const rabbitHost =
    process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_HOST : 'localhost';
  const rabbitPort =
    process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_PORT : '5672';
  const uri = `amqp://rabbitmq:rabbitmq@${rabbitHost}:${rabbitPort}`;

  let app: INestApplication;
  let amqpConnection: AmqpConnection;
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      providers: [],
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
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    amqpConnection = app.get<AmqpConnection>(AmqpConnection);
    await amqpConnection.channel.assertQueue(queue);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should allow for a ConsumerTag to cancel and resume a subscription', async () => {
    const subscriptionCallback = jest.fn();
    const { consumerTag } = await amqpConnection.createSubscriber(
      (msg) => subscriptionCallback(msg),
      {
        exchange,
        routingKey: [routingKey1],
        queue: queue,
      },
      'testingCallback',
    );
    // Make sure the subscription is functional
    await amqpConnection.publish(exchange, routingKey1, `manual-testMessage-1`);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(subscriptionCallback).toHaveBeenCalledWith(`manual-testMessage-1`);
    subscriptionCallback.mockReset();
    // Perform cancel using consumer tag
    await amqpConnection.cancelConsumer(consumerTag);
    await new Promise((resolve) => setTimeout(resolve, 50));
    // Make sure published messages are not received by the canceled consumer
    await amqpConnection.publish(exchange, routingKey1, `manual-testMessage-2`);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(subscriptionCallback).not.toHaveBeenCalled();
    subscriptionCallback.mockReset();
    // Resume the consumer
    await amqpConnection.resumeConsumer(consumerTag);
    await new Promise((resolve) => setTimeout(resolve, 50));
    // Make sure the subscription was reestablished
    await amqpConnection.publish(exchange, routingKey1, `manual-testMessage-3`);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(subscriptionCallback).toHaveBeenCalledWith(`manual-testMessage-3`);
  });
});
