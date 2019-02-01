// import { makeCacheInterceptor } from '@nestjs-plus/caching';
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  // @UseInterceptors(
  //   makeCacheInterceptor({
  //     getKey: () => '42',
  //     ttl: 5,
  //   }),
  // )
  getHello(): string {
    return this.appService.getHello();
  }
}
