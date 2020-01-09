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
): Provider[] {
  if (options.useFactory) {
    return [
      {
        provide,
        useFactory: options.useFactory,
        inject: options.inject || []
      }
    ];
  }

  const optionsProvider = {
    provide,
    useFactory: async (moduleConfigFactory: ModuleConfigFactory<T>) => {
      return moduleConfigFactory.createModuleConfig();
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

  if (options.useClass) {
    return [
      optionsProvider,
      {
        provide: options.useClass,
        useClass: options.useClass
      }
    ];
  }

  if (options.useExisting) {
    return [
      optionsProvider,
      {
        provide:
          options.useExisting.provide ||
          options.useExisting.value.constructor.name,
        useValue: options.useExisting.value
      }
    ];
  }

  return [];
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

export function createConfigurableDynamicRootModule<T, U>(
  moduleConfigToken: InjectionToken,
  moduleProperties: Partial<
    Pick<ModuleMetadata, 'imports' | 'exports' | 'providers'>
  > = {
    imports: [],
    exports: [],
    providers: []
  }
) {
  abstract class DynamicRootModule {
    static moduleSubject = new Subject<DynamicModule>();

    static forRootAsync(
      moduleCtor: Type<T>,
      asyncModuleConfig: AsyncModuleConfig<U>
    ): DynamicModule {
      const dynamicModule = {
        module: moduleCtor,
        imports: [
          ...(asyncModuleConfig.imports || []),
          ...(moduleProperties.imports || [])
        ],
        exports: [
          ...(asyncModuleConfig.exports || []),
          ...(moduleProperties.exports || [])
        ],
        providers: [
          ...createModuleConfigProvider(moduleConfigToken, asyncModuleConfig),
          ...(moduleProperties.providers || [])
        ]
      };

      DynamicRootModule.moduleSubject.next(dynamicModule);

      return dynamicModule;
    }

    static forRoot(moduleCtor: Type<T>, moduleConfig: U): DynamicModule {
      const dynamicModule = {
        module: moduleCtor,
        imports: [...(moduleProperties.imports || [])],
        exports: [...(moduleProperties.exports || [])],
        providers: [
          {
            provide: moduleConfigToken,
            useValue: moduleConfig
          },
          ...(moduleProperties.providers || [])
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
        map(() => {
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
