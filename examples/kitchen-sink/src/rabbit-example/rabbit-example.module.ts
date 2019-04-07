import { RabbitMQModule } from '@nestjs-plus/rabbitmq';
import { Module } from '@nestjs/common';
import { MessagingController } from './messaging/messaging.controller';
import { MessagingService } from './messaging/messaging.service';

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      useFactory: () => ({
        exchanges: [
          {
            name: 'exchange1',
            type: 'topic',
          },
          {
            name: 'exchange2',
            type: 'fanout',
          },
        ],
        uri: 'amqp://rabbitmq:rabbitmq@localhost:5672',
      }),
    }),
    RabbitExampleModule,
  ],
  providers: [MessagingService],
  controllers: [MessagingController],
})
export class RabbitExampleModule {}
