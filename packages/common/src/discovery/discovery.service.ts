import { Injectable } from '@nestjs/common';
import {
  Controller,
  Injectable as NestInjectable
} from '@nestjs/common/interfaces';
import { InstanceWrapper } from '@nestjs/core/injector/container';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { flatMap } from 'lodash';
import {
  ComponentWrapper,
  Filter,
  MetaKey,
  MethodMeta
} from './discovery.interfaces';

type ProviderFilter = Filter<InstanceWrapper<NestInjectable>>;
type ControllerFilter = Filter<InstanceWrapper<Controller>>;

export const providerWithMetaKey: (
  key: MetaKey
) => ProviderFilter = key => injectable =>
  Reflect.getMetadata(key, injectable.instance.constructor);

export const controllerWithMetaKey: (
  key: MetaKey
) => ControllerFilter = key => controller =>
  Reflect.getMetadata(key, controller.instance.constructor);

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
  discoverProviders(filter: ProviderFilter): InstanceWrapper<NestInjectable>[] {
    const providers = this.getKeyedModuleProviders();

    const filtered = flatMap(providers, componentMap =>
      flatMap([...componentMap.entries()], ([key, value]) => ({
        match: filter(value),
        value
      }))
    )
      .filter(x => x.match)
      .map(x => x.value);

    return filtered;
  }

  /**
   * Discovers all controllers in a Nest App that match a filter
   * @param providerFilter
   */
  discoverControllers(filter: ControllerFilter): InstanceWrapper<Controller>[] {
    const controllers = this.getKeyedModuleControllers();

    const filtered = flatMap(controllers, componentMap =>
      flatMap([...componentMap.entries()], ([key, value]) => ({
        match: filter(value),
        value
      }))
    )
      .filter(x => x.match)
      .map(x => x.value);

    return filtered;
  }

  discoverMethodMeta<T>(
    component: ComponentWrapper,
    metaKey: MetaKey
  ): MethodMeta<T>[] {
    const { instance } = component;
    const prototype = Object.getPrototypeOf(instance);

    return this.metadataScanner
      .scanFromPrototype(instance, prototype, name =>
        this.extractMethodMeta<T>(metaKey, component, prototype, name)
      )
      .filter(x => !!x.meta);
  }

  /**
   * Discovers all the methods that exist on providers in a Nest App that contain metadata under a specific key
   * @param metaKey The metakey to scan for
   */
  discoverProviderMethodsWithMeta<T>(metaKey: MetaKey): MethodMeta<T>[] {
    const providers = this.discoverProviders(() => true);

    return flatMap(providers, provider =>
      this.discoverMethodMeta<T>(provider, metaKey)
    );
  }

  /**
   * Discovers all the methods that exist on controllers in a Nest App that contain metadata under a specific key
   * @param metaKey The metakey to scan for
   */
  discoverControllerMethodsWithMeta<T>(metaKey: MetaKey): MethodMeta<T>[] {
    const controllers = this.discoverControllers(() => true);

    return flatMap(controllers, controller =>
      this.discoverMethodMeta<T>(controller, metaKey)
    );
  }

  private getKeyedModuleProviders() {
    return [...this.modulesContainer.values()].map(
      nestModule => nestModule.components
    );
  }

  private getKeyedModuleControllers() {
    return [...this.modulesContainer.values()].map(
      nestModule => nestModule.routes
    );
  }

  private extractMethodMeta<T>(
    metaKey: MetaKey,
    component: ComponentWrapper,
    prototype: any,
    methodName: string
  ): MethodMeta<T> {
    const handler = prototype[methodName];
    const meta: T = Reflect.getMetadata(metaKey, handler);

    return {
      meta,
      handler,
      component,
      methodName
    };
  }
}
