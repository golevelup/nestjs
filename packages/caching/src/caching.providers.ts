import { Provider } from '@nestjs/common';
import { CacheToken } from './caching.constants';
// import * as cacheManager from 'cache-manager';

export function createCacheManager(): Provider {
  return {
    provide: CacheToken,
    useFactory: () => {
      // This needs to be a factory itself as it's tied to TTL etc
      // const cache = cacheManager.caching({
      //     max:
      // })
    }
  };
}
