import { CachingModule } from '@nestjs-plus/caching';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [CachingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
