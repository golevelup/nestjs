import { Type } from '@nestjs/common';
import { ModuleMetadata, Provider } from '@nestjs/common/interfaces';
import { get } from 'lodash';

export interface OptionsFactory<T> {
  createOptions(): Promise<T> | T;
}

export interface AsyncOptionsFactoryProvider<T>
  extends Pick<ModuleMetadata, 'imports' | 'exports'> {
  useExisting?: {
    value: OptionsFactory<T>;
    provide?: string | symbol | Type<any>;
  };
  useClass?: Type<OptionsFactory<T>>;
  useFactory?: (...args: any[]) => Promise<T> | T;
  inject?: any[];
}

export function createAsyncOptionsProvider<T>(
  provide: string | symbol | Type<any>,
  options: AsyncOptionsFactoryProvider<T>
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
    useFactory: async (optionsFactory: OptionsFactory<T>) => {
      return optionsFactory.createOptions();
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
