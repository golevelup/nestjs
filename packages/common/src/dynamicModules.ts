import { DynamicModule, Provider, Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { get } from 'lodash';
import { interval, race, Subject } from 'rxjs';
import { first, map } from 'rxjs/operators';

type InjectionToken = string | symbol | Type<any>;

export interface ModuleConfigFactory<T> {
  createModuleConfig(): Promise<T> | T;
}

export interface AsyncModuleConfig<T>
  extends Pick<ModuleMetadata, 'imports' | 'exports'> {
  useExisting?: {
    value: ModuleConfigFactory<T>;
    provide?: InjectionToken;
  };
  useClass?: Type<ModuleConfigFactory<T>>;
  useFactory?: (...args: any[]) => Promise<T> | T;
  inject?: any[];
}

export function createModuleConfigProvider<T>(
  provide: InjectionToken,
  options: AsyncModuleConfig<T>
): Provider {
  if (options.useFactory) {
    return {
      provide,
      useFactory: options.useFactory,
      inject: options.inject || []
    };
  }

  return {
    provide,
    useFactory: async (moduleConfigFactory: ModuleConfigFactory<T>) => {
      const options = await moduleConfigFactory.createModuleConfig();
      return options;
    },
    inject: [
      options.useClass ||
        get(
          options,
          'useExisting.provide',
          (options.useExisting as any).value.constructor.name
        )
    ]
  };
}

export interface IConfigurableDynamicRootModule<T, U> {
  new (): Type<T>;

  moduleSubject: Subject<DynamicModule>;

  forRoot(moduleCtor: Type<T>, moduleConfig: U): DynamicModule;

  forRootAsync(
    moduleCtor: Type<T>,
    asyncModuleConfig: AsyncModuleConfig<U>
  ): DynamicModule;

  externallyConfigured(
    moduleCtor: Type<T>,
    wait: number
  ): Promise<DynamicModule>;
}

export function MakeConfigurableDynamicRootModule<T, U>(
  moduleConfigToken: InjectionToken,
  additionalProviders: Provider[] = []
) {
  abstract class DynamicRootModule {
    static moduleSubject = new Subject<DynamicModule>();

    static forRootAsync(
      moduleCtor: Type<T>,
      asyncModuleConfig: AsyncModuleConfig<U>
    ): DynamicModule {
      const dynamicModule = {
        module: moduleCtor,
        imports: asyncModuleConfig.imports,
        exports: asyncModuleConfig.exports,
        providers: [
          createModuleConfigProvider(moduleConfigToken, asyncModuleConfig),
          ...additionalProviders
        ]
      };

      DynamicRootModule.moduleSubject.next(dynamicModule);

      return dynamicModule;
    }

    static forRoot(moduleCtor: Type<T>, moduleConfig: U): DynamicModule {
      const dynamicModule = {
        module: moduleCtor,
        providers: [
          {
            provide: moduleConfigToken,
            useValue: moduleConfig
          },
          ...additionalProviders
        ]
      };

      DynamicRootModule.moduleSubject.next(dynamicModule);

      return dynamicModule;
    }

    static async externallyConfigured(
      moduleCtor: Type<T>,
      wait: number
    ): Promise<DynamicModule> {
      const timeout$ = interval(wait).pipe(
        first(),
        map(x => {
          throw new Error(
            `Expected ${
              moduleCtor.name
            } to be configured by at last one Module but it was not configured within ${wait}ms`
          );
        })
      );

      return race(
        timeout$,
        DynamicRootModule.moduleSubject.pipe(first())
      ).toPromise();
    }
  }

  return DynamicRootModule as IConfigurableDynamicRootModule<T, U>;
}
