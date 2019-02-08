import { Injectable } from '@nestjs/common';
import { Injectable as NestInjectable } from '@nestjs/common/interfaces';
import { InstanceWrapper } from '@nestjs/core/injector/container';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { flatMap } from 'lodash';

export type MetaKey = string | number | Symbol;

type ProviderFilter = (
  injectableWrapper: InstanceWrapper<NestInjectable>
) => boolean;

type HandlerFilter = (
  injectable: NestInjectable,
  prototype: any,
  methodName: string
) => boolean;

export const providerWithMetaKey: (
  key: MetaKey
) => ProviderFilter = key => injectable =>
  Reflect.getMetadata(key, injectable.instance.constructor);

export const handlerWithMetaKey: (key: MetaKey) => HandlerFilter = key => (
  injectable,
  prototype,
  methodName
) => Reflect.getMetadata(key, prototype[methodName]);

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
   * Discovers all the handlers that exist on providers in a Nest App that match a filter
   * @param providerFilter
   * @param handlerFilter
   */
  discoverHandlers(
    providerFilter: ProviderFilter,
    handlerFilter: HandlerFilter
  ) {
    const providers = this.discoverProviders(providerFilter);

    return flatMap(providers, provider => {
      const { instance } = provider;
      const prototype = Object.getPrototypeOf(instance);

      return this.metadataScanner.scanFromPrototype(instance, prototype, name =>
        handlerFilter(instance, prototype, name)
      );
    });
  }

  private getKeyedModuleProviders() {
    return [...this.modulesContainer.values()].map(
      nestModule => nestModule.components
    );
  }
}
