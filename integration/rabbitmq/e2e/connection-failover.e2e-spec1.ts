import {
  RabbitMQModule,
  RabbitRPC,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');

const rabbitHost =
  process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_HOST : 'localhost';
const rabbitPort =
  process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_PORT : '5672';
const uri = `amqp://user:bitnami@${rabbitHost}:${rabbitPort}2`;

const prefix = 'multiplechannels-';
const routePrefix = `${prefix}route-`;
const queuePrefix = `${prefix}queue-`;
const exchange = `${prefix}exchange`;
const channel1 = `${prefix}1`;
const channel2 = `${prefix}2`;

const pubsubMessageHandler = jest.fn();

@Injectable()
class SubscribeService {
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
}

@Controller('rest')
export class RestController {
  @Get()
  getHello(): string {
    return 'Hello World!';
  }
}

@Module({
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
        [channel2]: {},
      },
      uri,
      connectionInitOptions: { wait: false },
    }),
  ],
  controllers: [RestController],
  providers: [RestController, SubscribeService],
})
export class RestModule {}

describe('Rabbit Subscribe and RPC connection failover test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [RestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should start http server when the connection uri is wrong', () => {
    return request(app.getHttpServer()).get('/rest').expect(200);
  });
});
