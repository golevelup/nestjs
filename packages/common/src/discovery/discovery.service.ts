import { Injectable } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import {
  Controller,
  Injectable as NestInjectable
} from '@nestjs/common/interfaces';
import { InstanceWrapper } from '@nestjs/core/injector/container';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { flatMap, uniqBy } from 'lodash';
import {
  ComponentMeta,
  ComponentWrapper,
  Filter,
  MetaKey,
  MethodMeta
} from './discovery.interfaces';

type ProviderFilter = Filter<InstanceWrapper<NestInjectable>>;
type ControllerFilter = Filter<InstanceWrapper<Controller>>;

/**
 * A controller filter that can be used to scan for all Providers in an App that contain meta at a
 * certain key
 * @param key The meta key to search for
 */
export const providerWithMetaKey: (
  key: MetaKey
) => ProviderFilter = key => provider =>
  Reflect.getMetadata(key, provider.metatype);

/**
 * A controller filter that can be used to scan for all Controllers in an App that contain meta at a
 * certain key
 * @param key The meta key to search for
 */
export const controllerWithMetaKey: (
  key: MetaKey
) => ControllerFilter = key => controller =>
  Reflect.getMetadata(key, controller.metatype);

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
  providers(filter: ProviderFilter): InstanceWrapper<NestInjectable>[] {
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
   * Discovers all controller methods that either directly have a certain meta key attached to them
   * or belong to a controller that has the same meta key attached to them
   * @param metaKey The meta key to scan for
   * @param metaFilter An optional filter for the contents of the meta object
   * @package
   * @example ```
 ```
   */
  methodsAndControllerMethodsWithMeta<T>(
    metaKey: MetaKey,
    metaFilter: (T) => boolean = meta => true
  ): MethodMeta<T>[] {
    const controllersWithMeta = this.controllersWithMeta<T>(metaKey).filter(x =>
      metaFilter(x.meta)
    );

    const methodsFromDecoratedControllers = flatMap(
      controllersWithMeta,
      controller => {
        return this.methodMetaFromComponent<T>(
          controller.component,
          PATH_METADATA
        );
      }
    );

    const decoratedMethods = this.controllerMethodsWithMeta<T>(metaKey).filter(
      x => metaFilter(x.meta)
    );

    return uniqBy(
      [...methodsFromDecoratedControllers, ...decoratedMethods],
      x => x.handler
    );
  }

  /**
   * Discovers all providers in an App that have meta at a specific key and returns the provider(s) and associated meta
   * @param metaKey The metakey to scan for
   */
  providersWithMeta<T>(metaKey: MetaKey): ComponentMeta<T>[] {
    const providers = this.controllers(providerWithMetaKey(metaKey));

    return providers.map(x => ({
      meta: Reflect.getMetadata(metaKey, x.metatype) as T,
      component: x
    }));
  }

  /**
   * Discovers all controllers in a Nest App that match a filter
   * @param providerFilter
   */
  controllers(filter: ControllerFilter): InstanceWrapper<Controller>[] {
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

  /**
   * Discovers all controllers in an App that have meta at a specific key and returns the controller(s) and associated meta
   * @param metaKey The metakey to scan for
   */
  controllersWithMeta<T>(metaKey: MetaKey): ComponentMeta<T>[] {
    const controllers = this.controllers(controllerWithMetaKey(metaKey));

    return controllers.map(x => ({
      meta: Reflect.getMetadata(metaKey, x.metatype) as T,
      component: x
    }));
  }

  /**
   * Discovers all method handlers matching a particular metakey from a Provider or Controller
   * @param component
   * @param metaKey
   */
  methodMetaFromComponent<T>(
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
   * @param providerFilter A predicate used to limit the providers being scanned. Defaults to all providers in the app module
   */
  providerMethodsWithMeta<T>(
    metaKey: MetaKey,
    providerFilter: ProviderFilter = x => true
  ): MethodMeta<T>[] {
    const providers = this.providers(providerFilter);

    return flatMap(providers, provider =>
      this.methodMetaFromComponent<T>(provider, metaKey)
    );
  }

  /**
   * Discovers all the methods that exist on controllers in a Nest App that contain metadata under a specific key
   * @param metaKey The metakey to scan for
   * @param controllerFilter A predicate used to limit the controllers being scanned. Defaults to all providers in the app module
   */
  controllerMethodsWithMeta<T>(
    metaKey: MetaKey,
    controllerFilter: ControllerFilter = x => true
  ): MethodMeta<T>[] {
    const controllers = this.controllers(controllerFilter);

    return flatMap(controllers, controller =>
      this.methodMetaFromComponent<T>(controller, metaKey)
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
