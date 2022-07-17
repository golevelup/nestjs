import {
  AmqpConnection,
  RabbitMQModule,
  RabbitRPC,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

const rabbitHost =
  process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_HOST : 'localhost';
const rabbitPort =
  process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_PORT : '5672';
const uri = `amqp://rabbitmq:rabbitmq@${rabbitHost}:${rabbitPort}`;

const prefix = 'multiplechannels-';
const routePrefix = `${prefix}route-`;
const queuePrefix = `${prefix}queue-`;
const exchange = `${prefix}exchange`;
const channel1 = `${prefix}1`;
const channel2 = `${prefix}2`;
const channel3 = `${prefix}3`;
const defaultChannel = `${prefix}default`;
let pubsubPrefetchN = 1;
let rpcPrefetchN = 1;

const pubsubMessageHandler = jest.fn();

@Injectable()
class SubscribeToMultipleChannelsService {
  @RabbitSubscribe({
    exchange,
    routingKey: `${routePrefix}1`,
    queue: `${queuePrefix}1`,
    queueOptions: {
      channel: channel2,
    },
  })
  pubsubMessageOverChannel2(payload) {
    pubsubMessageHandler(payload);
  }

  @RabbitRPC({
    exchange,
    routingKey: `${routePrefix}2`,
    queue: `${queuePrefix}2`,
    queueOptions: {
      channel: channel1,
    },
  })
  rpcMessageOverChannel1(payload) {
    return {
      response: 'hi',
      payload,
    };
  }

  @RabbitSubscribe({
    exchange,
    routingKey: `${routePrefix}3`,
    queue: `${queuePrefix}3`,
    queueOptions: {
      channel: 'i-do-not-exist-channel-1',
    },
  })
  pubsubMessageOverNonExistingChannel(payload) {
    pubsubMessageHandler(payload);
  }

  @RabbitRPC({
    exchange,
    routingKey: `${routePrefix}4`,
    queue: `${queuePrefix}4`,
    queueOptions: {
      channel: 'i-do-not-exist-channel-2',
    },
  })
  rpcMessageOverNonExistingChannel(payload) {
    return {
      response: 'bonjour',
      payload,
    };
  }

  @RabbitSubscribe({
    exchange,
    routingKey: `${routePrefix}5`,
    queue: `${queuePrefix}5`,
  })
  pubsubMessageOverDefaultChannel(payload) {
    pubsubMessageHandler(payload);
  }

  @RabbitRPC({
    exchange,
    routingKey: `${routePrefix}6`,
    queue: `${queuePrefix}6`,
  })
  rpcMessageOverDefaultChannel(payload) {
    return {
      response: 'yasou',
      payload,
    };
  }

  @RabbitSubscribe({
    exchange,
    routingKey: `${routePrefix}7`,
    queue: `${queuePrefix}7`,
    queueOptions: {
      channel: channel1,
    },
  })
  pubsubMessageOverChannel1WithPrefetch(payload) {
    pubsubMessageHandler({
      actual: pubsubPrefetchN,
      received: payload.n,
    });

    pubsubPrefetchN++;
  }

  // Using channel3 so it doesn't combine with channel1 prefetch count.
  @RabbitRPC({
    exchange,
    routingKey: `${routePrefix}8`,
    queue: `${queuePrefix}8`,
    queueOptions: {
      channel: channel3,
    },
  })
  rpcMessageOverChannel1WithPrefetch(payload) {
    const resp = {
      actual: rpcPrefetchN,
      received: payload.n,
    };

    rpcPrefetchN++;

    return resp;
  }
}

describe('Rabbit Multiple Channels', () => {
  let app: INestApplication;
  let amqpConnection: AmqpConnection;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      providers: [SubscribeToMultipleChannelsService],
      imports: [
        RabbitMQModule.forRoot(RabbitMQModule, {
          exchanges: [
            {
              name: exchange,
              type: 'topic',
            },
          ],
          channels: {
            [channel1]: {
              prefetchCount: 1,
            },
            [defaultChannel]: {
              default: true,
            },
            [channel2]: {},
            [channel3]: {
              prefetchCount: 1,
            },
          },
          uri,
          connectionInitOptions: { wait: true, reject: true, timeout: 3000 },
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    amqpConnection = app.get<AmqpConnection>(AmqpConnection);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should receive pub/sub message over channel 2', (done) => {
    const payload = { message: 'hello' };
    amqpConnection.publish(exchange, `${routePrefix}1`, payload);

    setTimeout(() => {
      expect(pubsubMessageHandler).toHaveBeenCalledTimes(1);
      expect(pubsubMessageHandler).toHaveBeenCalledWith(payload);

      done();
    }, 50);
  });

  it('should receive rpc message over channel 1', async () => {
    const payload = { message: 'ola' };
    const response = await amqpConnection.request({
      exchange,
      routingKey: `${routePrefix}2`,
      payload,
    });

    expect(response).toEqual({
      response: 'hi',
      payload,
    });
  });

  it('should receive pub/sub message over non-existing channel', (done) => {
    const payload = { message: 'hi' };
    amqpConnection.publish(exchange, `${routePrefix}3`, payload);

    // eslint-disable-next-line sonarjs/no-identical-functions
    setTimeout(() => {
      expect(pubsubMessageHandler).toHaveBeenCalledTimes(1);
      expect(pubsubMessageHandler).toHaveBeenCalledWith(payload);

      done();
    }, 50);
  });

  it('should receive rpc message over non-existing channel', async () => {
    const payload = { message: 'ola' };
    const response = await amqpConnection.request({
      exchange,
      routingKey: `${routePrefix}4`,
      payload,
    });

    expect(response).toEqual({
      response: 'bonjour',
      payload,
    });
  });

  it('should receive pub/sub message over default channel', (done) => {
    const payload = { message: 'guten tag' };
    amqpConnection.publish(exchange, `${routePrefix}5`, payload);

    // eslint-disable-next-line sonarjs/no-identical-functions
    setTimeout(() => {
      expect(pubsubMessageHandler).toHaveBeenCalledTimes(1);
      expect(pubsubMessageHandler).toHaveBeenCalledWith(payload);

      done();
    }, 50);
  });

  it('should receive rpc message over default channel', async () => {
    const payload = { message: 'hi' };
    const response = await amqpConnection.request({
      exchange,
      routingKey: `${routePrefix}6`,
      payload,
    });

    expect(response).toEqual({
      response: 'yasou',
      payload,
    });
  });

  it('should receive pub/sub messages in order with prefetch 1 on channel 1', (done) => {
    const numbers = [1, 2, 3, 4, 5];

    numbers.forEach((n) =>
      amqpConnection.publish(exchange, `${routePrefix}7`, { n }),
    );

    setTimeout(() => {
      expect(pubsubMessageHandler).toHaveBeenCalledTimes(numbers.length);
      numbers.forEach((n) =>
        expect(pubsubMessageHandler).toHaveBeenCalledWith({
          actual: n,
          received: n,
        }),
      );

      done();
    }, 50);
  });

  it('should receive rpc messages in order with prefetch 1 on channel 3', async () => {
    const numbers = [1, 2, 3, 4, 5];
    const response = await Promise.all(
      numbers.map((n) =>
        amqpConnection.request({
          exchange,
          routingKey: `${routePrefix}8`,
          payload: { n },
        }),
      ),
    );

    expect(response).toEqual(numbers.map((n) => ({ actual: n, received: n })));
  });
});
