import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RabbitMQModule } from '@nestjs-plus/rabbitmq';
import { RpcService } from './rpc/rpc.service';

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      useFactory: () => ({
        exchanges: [
          {
            name: 'exchange1',
            type: 'topic',
          },
        ],
        uri: 'amqp://rabbitmq:rabbitmq@localhost:5672',
      }),
    }),
  ],
  controllers: [AppController],
  providers: [RpcService],
})
export class AppModule {}
