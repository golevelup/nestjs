import { CachingModule } from '@nestjs-plus/caching';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// const testCache: Cache = {
//   get: async (key: string) => null,
//   del: async (key: string) => {
//     console.log(key);
//     return;
//   },
//   set: async (key, data, ttl) => {
//     console.log(key, data, ttl);
//     return;
//   },
// };

@Module({
  imports: [CachingModule],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: CacheToken,
    //   useValue: new MemoryCache(),
    // },
  ],
})
export class AppModule {}
