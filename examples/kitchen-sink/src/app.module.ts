import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitExampleModule } from './rabbit-example/rabbit-example.module';

@Module({
  imports: [RabbitExampleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
