import { RabbitMQModule } from '@levelup-nestjs/rabbitmq';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RpcService } from './rpc/rpc.service';

const rabbitHost = process.env.NODE_ENV === 'ci' ? 'rabbit' : 'localhost';

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: () => ({
        exchanges: [
          {
            name: 'exchange1',
            type: 'topic',
          },
        ],
        uri: `amqp://rabbitmq:rabbitmq@${rabbitHost}:5672`,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [RpcService],
})
export class AppModule {}
