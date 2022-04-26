import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import {
  CONNECTION_NAME,
  PREFIX,
} from './named-connection-submodule.constants';
import { NamedConnectionSubmoduleController } from './named-connection-submodule.controller';

const rabbitHost =
  process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_HOST : 'localhost';
const rabbitPort =
  process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_PORT : '5672';
const uri = `amqp://rabbitmq:rabbitmq@${rabbitHost}:${rabbitPort}`;

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: () => ({
        name: CONNECTION_NAME,
        exchanges: [
          {
            name: `${PREFIX}-exchange`,
            type: 'topic',
          },
        ],
        uri,
        connectionInitOptions: { wait: true, reject: true, timeout: 3000 },
      }),
    }),
  ],
  controllers: [NamedConnectionSubmoduleController],
  providers: [NamedConnectionSubmoduleController],
})
export class NamedConnectionSubmoduleModule {}
