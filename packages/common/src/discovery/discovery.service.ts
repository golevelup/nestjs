import { Injectable } from '@nestjs/common';
import { Injectable as NestInjectable } from '@nestjs/common/interfaces';
import { InstanceWrapper } from '@nestjs/core/injector/container';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { flatMap } from 'lodash';
import { MetaKey, MethodMeta, ProviderFilter } from './discovery.interfaces';

export const providerWithMetaKey: (
  key: MetaKey
) => ProviderFilter = key => injectable =>
  Reflect.getMetadata(key, injectable.instance.constructor);

@Injectable()
export class DiscoveryService {
  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner
  ) {}

  /**
   * Discovers all providers in a Nest App that match a filter
   * @param providerFilter
   */
  discoverProviders(
    providerFilter: ProviderFilter
  ): InstanceWrapper<NestInjectable>[] {
    const providers = this.getKeyedModuleProviders();

    const filtered = flatMap(providers, componentMap =>
      flatMap([...componentMap.entries()], ([key, value]) => ({
        match: providerFilter(value),
        value
      }))
    )
      .filter(x => x.match)
      .map(x => x.value);

    return filtered;
  }

  /**
   * Discovers all the handlers that exist on providers in a Nest App that contain metadata under a specific key
   * @param metaKey The metakey to scan for
   */
  discoverHandlersWithMeta<T>(metaKey: MetaKey): MethodMeta<T>[] {
    const providers = this.discoverProviders(() => true);

    return flatMap(providers, provider => {
      const { instance } = provider;
      const prototype = Object.getPrototypeOf(instance);

      return this.metadataScanner
        .scanFromPrototype(instance, prototype, name =>
          this.extractMeta<T>(metaKey, provider, prototype, name)
        )
        .filter(x => !!x.meta);
    });
  }

  private getKeyedModuleProviders() {
    return [...this.modulesContainer.values()].map(
      nestModule => nestModule.components
    );
  }

  private extractMeta<T>(
    metaKey: MetaKey,
    provider: InstanceWrapper<NestInjectable>,
    prototype: any,
    methodName: string
  ): MethodMeta<T> {
    const handler = prototype[methodName];
    const meta: T = Reflect.getMetadata(metaKey, handler);

    return {
      meta,
      handler,
      provider,
      methodName
    };
  }
}
