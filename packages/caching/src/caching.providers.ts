import { Provider } from '@nestjs/common';
import { CACHE_TOKEN } from './caching.constants';
// import * as cacheManager from 'cache-manager';

export function createCacheManager(): Provider {
  return {
    provide: CACHE_TOKEN,
    useFactory: () => {
      // This needs to be a factory itself as it's tied to TTL etc. Maybe can be memoized based on options
      // const cache = cacheManager.caching({
      //     max:
      // })
    }
  };
}
