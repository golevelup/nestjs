import {
  AmqpConnection,
  RabbitMQModule,
  RabbitRPC,
} from '@golevelup/nestjs-rabbitmq';
import { INestApplication, Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';

const testHandler = jest.fn();

const prefix = 'testRpcNoDirectReply';
const exchange = prefix;
const routingKey = `${prefix}Route`;

@Injectable()
class RpcService {
  @RabbitRPC({
    exchange,
    routingKey: [routingKey],
    queue: `${prefix}Queue`,
  })
  handleSubscribe(message: object) {
    testHandler(message);
    return 'pong';
  }
}

describe('Rabbit Direct Reply To', () => {
  let app: INestApplication;
  let amqpConnection: AmqpConnection;

  const rabbitHost =
    process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_HOST : 'localhost';
  const rabbitPort =
    process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_PORT : '5672';
  const uri = `amqp://rabbitmq:rabbitmq@${rabbitHost}:${rabbitPort}`;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      providers: [RpcService],
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
          enableDirectReplyTo: false,
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

  it('should not receive subscribe messages because register handlers is disabled', async () => {
    await expect(
      amqpConnection.request({
        exchange,
        routingKey,
        payload: 'ping',
        timeout: 2000,
      }),
    ).rejects.toThrow();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(testHandler).not.toHaveBeenCalled();
  });
});
