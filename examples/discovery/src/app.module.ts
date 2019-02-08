import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiscoveryModule } from './discovery/discovery.module';
import { ExampleService } from './example/example.service';
import { AnotherService } from './example/another/another.service';

@Module({
  imports: [DiscoveryModule],
  controllers: [AppController],
  providers: [AppService, ExampleService, AnotherService],
})
export class AppModule {}
