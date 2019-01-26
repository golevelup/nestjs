import { Module } from '@nestjs/common';
import { CachingInterceptor } from './caching.interceptor';

@Module({
  providers: [CachingInterceptor]
})
export class CachingModule {}
