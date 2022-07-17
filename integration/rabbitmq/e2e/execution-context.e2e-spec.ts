import {
  AmqpConnection,
  isRabbitContext,
  RabbitMQModule,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { INestApplication, Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';

const interceptorHandler = jest.fn();

const exchange = 'executionContextExchange';
const queue = 'executionContextQueue';

@Injectable()
class TestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const shouldSkip = isRabbitContext(context);
    if (shouldSkip) {
      return next.handle();
    }

    interceptorHandler('invoked');
    return next.handle();
  }
}

@Injectable()
class SubscribeService {
  @RabbitSubscribe({
    exchange,
    routingKey: '#',
    queue,
  })
  handleSubscribe(message: object) {
    // tslint:disable-next-line:no-console
    console.log(`RECEIVED MESSAGE: ${message}`);
  }
}

describe('Rabbit Subscribe Without Register Handlers', () => {
  let app: INestApplication;
  let amqpConnection: AmqpConnection;

  const rabbitHost =
    process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_HOST : 'localhost';
  const rabbitPort =
    process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_PORT : '5672';
  const uri = `amqp://rabbitmq:rabbitmq@${rabbitHost}:${rabbitPort}`;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      providers: [SubscribeService, TestInterceptor],
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
    app.useGlobalInterceptors(new TestInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should recognize a rabbit handler execution context and allow for interceptors to be skipped', async () => {
    await amqpConnection.publish(exchange, 'x', `test-message`);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(interceptorHandler).not.toHaveBeenCalled();
  });
});
