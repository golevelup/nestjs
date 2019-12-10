import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { RpcService } from '../src/rpc/rpc.service';

describe('Rabbit RPC', () => {
  let app: INestApplication;
  let amqpConnection: AmqpConnection;

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeAll(async () => {
    const exchange = 'testRpcExhange';
    const rabbitHost = process.env.NODE_ENV === 'ci' ? 'rabbit' : 'localhost';
    const uri = `amqp://rabbitmq:rabbitmq@${rabbitHost}:5672`;

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
          connectionInit: { wait: true, reject: true },
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    amqpConnection = app.get<AmqpConnection>(AmqpConnection);
    await app.init();
  });

  it('regular RPC handler should receive a valid RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange1',
      routingKey: 'rpc',
      payload: {
        request: 'val',
      },
    });

    expect(response).toEqual({ echo: { request: 'val' } });
  });

  it('intercepted RPC handler should receive a transformed RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange1',
      routingKey: 'intercepted-rpc',
    });

    expect(response).toEqual({ transformed: { message: 42 } });
  });
});
