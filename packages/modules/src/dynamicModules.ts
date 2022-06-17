import { DynamicModule, Provider, Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { interval, lastValueFrom, race, Subject } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { OptionalFactoryDependency } from '@nestjs/common/interfaces/modules/optional-factory-dependency.interface';

type InjectionToken = string | symbol | Type;

export interface ModuleConfigFactory<T> {
  createModuleConfig(): Promise<T> | T;
}

export type AsyncModuleConfig<T> = Pick<ModuleMetadata, 'imports' | 'exports'> &
  (
    | {
        useExisting: {
          value: ModuleConfigFactory<T>;
          provide?: InjectionToken;
        };
      }
    | { useClass: Type<ModuleConfigFactory<T>> }
    | {
        useFactory: (...args: any[]) => Promise<T> | T;
        inject?: any[];
      }
  );

export function createModuleConfigProvider<T>(
  provide: InjectionToken,
  options: AsyncModuleConfig<T>
): Provider[] {
  if ('useFactory' in options) {
    return [
      {
        provide,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      },
    ];
  }

  const optionsProviderGenerator = (
    inject: InjectionToken | OptionalFactoryDependency
  ): Provider => ({
    provide,
    useFactory: async (moduleConfigFactory: ModuleConfigFactory<T>) => {
      return moduleConfigFactory.createModuleConfig();
    },
    inject: [inject],
  });

  if ('useClass' in options) {
    return [
      optionsProviderGenerator(options.useClass),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }
  if ('useExisting' in options) {
    return [
      optionsProviderGenerator(
        options.useExisting.provide ??
          options.useExisting.value.constructor.name
      ),
      {
        provide:
          options.useExisting.provide ||
          options.useExisting.value.constructor.name,
        useValue: options.useExisting.value,
      },
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
    Pick<ModuleMetadata, 'imports' | 'exports' | 'providers' | 'controllers'>
  > = {
    imports: [],
    exports: [],
    providers: [],
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
          ...(moduleProperties.imports || []),
        ],
        exports: [
          ...(asyncModuleConfig.exports || []),
          ...(moduleProperties.exports || []),
        ],
        providers: [
          ...createModuleConfigProvider(moduleConfigToken, asyncModuleConfig),
          ...(moduleProperties.providers || []),
        ],
      };

      DynamicRootModule.moduleSubject.next(dynamicModule);

      return dynamicModule;
    }

    static forRoot(moduleCtor: Type<T>, moduleConfig: U): DynamicModule {
      const dynamicModule: DynamicModule = {
        module: moduleCtor,
        imports: [...(moduleProperties.imports || [])],
        exports: [...(moduleProperties.exports || [])],
        controllers: [...(moduleProperties.controllers || [])],
        providers: [
          {
            provide: moduleConfigToken,
            useValue: moduleConfig,
          },
          ...(moduleProperties.providers || []),
        ],
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
            `Expected ${moduleCtor.name} to be configured by at last one Module but it was not configured within ${wait}ms`
          );
        })
      );

      return lastValueFrom(
        race(timeout$, DynamicRootModule.moduleSubject.pipe(first()))
      );
    }
  }

  return DynamicRootModule as IConfigurableDynamicRootModule<T, U>;
}
