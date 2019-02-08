import { Injectable } from '@nestjs/common';
import { Injectable as NestInjectable } from '@nestjs/common/interfaces';
import { InstanceWrapper } from '@nestjs/core/injector/container';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { flatMap } from 'lodash';

export function withMetaKey(
  metaKey: string | number | Symbol,
  injectableWrapper: InstanceWrapper<NestInjectable>
): boolean {
  return Reflect.getMetadata(metaKey, injectableWrapper.instance.constructor);
}

type ProviderFilter = (injectable: InstanceWrapper<NestInjectable>) => boolean;

@Injectable()
export class DiscoveryService {
  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner
  ) {}

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

  discoverHandlers(providerFilter: ProviderFilter) {
    const providers = this.discoverProviders(providerFilter);

    return flatMap(providers, provider => {
      const { instance } = provider;
      const prototype = Object.getPrototypeOf(instance);

      return this.metadataScanner.scanFromPrototype(
        instance,
        prototype,
        name => {
          const method = prototype[name];

          const check = Reflect.getMetadataKeys(method);
          console.log(name, check);

          return true;
        }
      );
    });
  }

  private getKeyedModuleProviders() {
    return [...this.modulesContainer.values()].map(
      nestModule => nestModule.components
    );
  }
}
