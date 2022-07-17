import {
  AmqpConnection,
  Nack,
  RabbitMQModule,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { INestApplication, Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const exchange = 'testSubscribeExhange';
const nackRoutingKey = 'nackRoutingKey';
const nackAndRequeueRoutingKey = 'nackAndRequeueRoutingKey';

const nackHandler = jest.fn();
const nackAndRequeueHandler = jest.fn();

@Injectable()
class SubscribeService {
  nackCount = 0;

  @RabbitSubscribe({
    exchange,
    routingKey: nackRoutingKey,
    queue: nackRoutingKey,
  })
  shouldNack() {
    nackHandler();
    return new Nack();
  }

  @RabbitSubscribe({
    exchange,
    routingKey: nackAndRequeueRoutingKey,
    queue: nackAndRequeueRoutingKey,
  })
  async shouldNackAndRequeueTimes3() {
    ++this.nackCount;
    nackAndRequeueHandler();
    // await sleep(15);
    if (this.nackCount >= 3) {
      return new Nack();
    }
    return new Nack(true);
  }
}

describe('Nack and Requeue', () => {
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
        RabbitMQModule.forRootAsync(RabbitMQModule, {
          useFactory: () => ({
            exchanges: [
              {
                name: exchange,
                type: 'topic',
              },
            ],
            uri,
            connectionInitOptions: { wait: true, reject: true, timeout: 3000 },
          }),
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    amqpConnection = app.get<AmqpConnection>(AmqpConnection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should nack the message when handler returns a Nack object', async () => {
    const spy = jest.spyOn(amqpConnection.channel, 'nack');

    amqpConnection.publish(exchange, nackRoutingKey, { msg: 'nack' });

    await sleep(100);

    expect(nackHandler).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expect.anything(), false, false);
  });

  it('should nack and requeue 3 times', async () => {
    const spy = jest.spyOn(amqpConnection.channel, 'nack');

    amqpConnection.publish(exchange, nackAndRequeueRoutingKey, {
      msg: 'nackAndRequeue',
    });

    await sleep(100);

    expect(nackAndRequeueHandler).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenCalledTimes(3);

    expect(spy.mock.calls[0]).toEqual([expect.anything(), false, true]);
    expect(spy.mock.calls[1]).toEqual([expect.anything(), false, true]);
    expect(spy.mock.calls[2]).toEqual([expect.anything(), false, false]);
  });
});
