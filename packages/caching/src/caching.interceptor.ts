import { makeInjectableMixin } from '@nestjs-plus/common';
import {
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Cache, CacheToken } from './cache';

@Injectable()
export abstract class CachingInterceptor implements NestInterceptor {
  protected abstract readonly options: CacheOptions;

  constructor(@Inject(CacheToken) private readonly cache: Cache) {}

  async intercept(
    context: ExecutionContext,
    call$: Observable<any>
  ): Promise<Observable<any>> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const key = this.options.getKey(request);

    const cached = await this.cache.get(key);
    if (cached != null) {
      return of(cached);
    }

    return call$.pipe(
      switchMap(result => {
        return forkJoin(
          of(result),
          this.cache.set(key, result, this.options.ttl)
        ).pipe(catchError(e => of(result)));
      }),
      map(([result, setOp]) => result)
    );
  }
}

export interface CacheOptions {
  ttl: number;
  getKey: (request) => string;
}

export const makeCacheInterceptor = (options: CacheOptions) => {
  return makeInjectableMixin('CachingInterceptor')(
    class extends CachingInterceptor {
      protected readonly options = options;
    }
  );
};
