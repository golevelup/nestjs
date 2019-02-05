import { DynamicModule, Module } from '@nestjs/common';
import { CACHE_TOKEN } from './caching.constants';

@Module({
  providers: [],
  exports: [CACHE_TOKEN]
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
