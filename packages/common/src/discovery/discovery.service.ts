import { Injectable } from '@nestjs/common';
import { Injectable as NestInjectable } from '@nestjs/common/interfaces';
import { InstanceWrapper } from '@nestjs/core/injector/container';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { flatMap } from 'lodash';

export const withMetaKey = (
  metaKey: string | number | Symbol,
  injectableWrapper: InstanceWrapper<NestInjectable>
) => Reflect.getMetadata(metaKey, injectableWrapper.instance.constructor);

@Injectable()
export class DiscoveryService {
  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner
  ) {}

  discoverClasses(
    predicate: (injectable: InstanceWrapper<NestInjectable>) => boolean
  ) {
    const components = this.getKeyedModuleComponents();

    const filtered = flatMap(components, componentMap =>
      flatMap([...componentMap.entries()], ([key, value]) => ({
        match: predicate(value),
        value
      }))
    )
      .filter(x => x.match)
      .map(x => x.value);

    return filtered;
  }

  private getKeyedModuleComponents() {
    return [...this.modulesContainer.values()].map(
      nestModule => nestModule.components
    );
  }
}
