import { DynamicModule, Module } from '@nestjs/common';
import { CacheToken } from './caching.constants';

@Module({
  providers: [],
  exports: [CacheToken]
})
export class CachingModule {
  static register(): DynamicModule {
    return {
      module: CachingModule
    };
  }

  static registerAsync(): DynamicModule {
    return {
      module: CachingModule
    };
  }
}
