import { Test } from '@nestjs/testing';
import { AmqpConnectionManager } from '../amqp/connectionManager';
import { RABBIT_CONFIG_TOKEN } from '../rabbitmq.constants';
import { RabbitMQConfig } from '../rabbitmq.interfaces';
import { RabbitMQModule } from '../rabbitmq.module';

const uri = 'amqp://rabbitmq:rabbitmq@test:5555';

describe(RabbitMQModule.name, () => {
  it('should create the module successfully', async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        RabbitMQModule.forRoot({
          uri,
        }),
      ],
    })
      .overrideProvider(AmqpConnectionManager)
      .useValue(new AmqpConnectionManager())
      .compile();

    const app = moduleFixture.createNestApplication();
    const connectionManager = app.get<AmqpConnectionManager>(
      AmqpConnectionManager,
    );
    const config = app.get<RabbitMQConfig>(RABBIT_CONFIG_TOKEN);

    expect(connectionManager).toBeInstanceOf(AmqpConnectionManager);
    expect(config).toEqual(expect.objectContaining({ uri }));
  });
});
