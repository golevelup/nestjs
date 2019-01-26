import { Cache } from '@nestjs-plus/caching';
import * as NodeCache from 'node-cache';

export class MemoryCache implements Cache {
  private readonly internalCache = new NodeCache();

  public get(key: string): Promise<any> {
    return Promise.resolve(this.internalCache.get(key));
  }

  public async set(key: string, data: any, ttl: number): Promise<void> {
    this.internalCache.set(key, data, ttl);
  }

  public async del(key: string) {
    this.internalCache.del(key);
  }
}
