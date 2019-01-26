import { CachingInterceptor } from '@nestjs-plus/caching';
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseInterceptors(CachingInterceptor)
  getHello(): string {
    return this.appService.getHello();
  }
}
