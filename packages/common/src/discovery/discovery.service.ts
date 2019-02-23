import { Injectable } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import {
  Controller,
  Injectable as NestInjectable
} from '@nestjs/common/interfaces';
import { InstanceWrapper } from '@nestjs/core/injector/container';
import { Module } from '@nestjs/core/injector/module';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { flatMap, uniqBy } from 'lodash';
import {
  DiscoveredClass,
  DiscoveredClassMeta,
  DiscoveredMethodMeta,
  Filter,
  MetaKey
} from './discovery.interfaces';

interface InternalComponent<T> {
  parentModule: Module;
  component: InstanceWrapper<T>;
}

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
  private readonly appProviders: InternalComponent<NestInjectable>[];
  private readonly appControllers: InternalComponent<Controller>[];

  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner
  ) {
    const modulesMap = [...this.modulesContainer.entries()];

    this.appProviders = flatMap(modulesMap, ([key, nestModule]) => {
      const components = [...nestModule.components.values()];
      return components.map(component => ({
        parentModule: nestModule,
        component
      }));
    });

    this.appControllers = flatMap(modulesMap, ([key, nestModule]) => {
      const components = [...nestModule.routes.values()];
      return components.map(component => ({
        parentModule: nestModule,
        component
      }));
    });
  }

  /**
   * Discovers all providers in a Nest App that match a filter
   * @param providerFilter
   */
  providers(filter: ProviderFilter): DiscoveredClass[] {
    return this.discover(this.appProviders, filter);
  }

  /**
   * Discovers all controller methods that either directly have a certain meta key attached to them
   * or belong to a controller that has the same meta key attached to them
   * @param metaKey The meta key to scan for
   * @param metaFilter An optional filter for the contents of the meta object
   */
  methodsAndControllerMethodsWithMeta<T>(
    metaKey: MetaKey,
    metaFilter: (T) => boolean = meta => true
  ): DiscoveredMethodMeta<T>[] {
    const controllersWithMeta = this.controllersWithMeta<T>(metaKey).filter(x =>
      metaFilter(x.meta)
    );

    const methodsFromDecoratedControllers = flatMap(
      controllersWithMeta,
      controller => {
        return this.methodMetaFromComponent<T>(
          controller.discoveredClass,
          PATH_METADATA
        );
      }
    );

    const decoratedMethods = this.controllerMethodsWithMeta<T>(metaKey).filter(
      x => metaFilter(x.meta)
    );

    return uniqBy(
      [...methodsFromDecoratedControllers, ...decoratedMethods],
      x => x.discoveredMethod.handler
    );
  }

  /**
   * Discovers all providers in an App that have meta at a specific key and returns the provider(s) and associated meta
   * @param metaKey The metakey to scan for
   */
  providersWithMeta<T>(metaKey: MetaKey): DiscoveredClassMeta<T>[] {
    const providers = this.providers(providerWithMetaKey(metaKey));

    return providers.map(x => ({
      meta: Reflect.getMetadata(metaKey, x.ctorFunction) as T,
      discoveredClass: x
    }));
  }

  /**
   * Discovers all controllers in a Nest App that match a filter
   * @param providerFilter
   */
  controllers(filter: ControllerFilter): DiscoveredClass[] {
    return this.discover(this.appControllers, filter);
  }

  /**
   * Discovers all controllers in an App that have meta at a specific key and returns the controller(s) and associated meta
   * @param metaKey The metakey to scan for
   */
  controllersWithMeta<T>(metaKey: MetaKey): DiscoveredClassMeta<T>[] {
    const controllers = this.controllers(controllerWithMetaKey(metaKey));

    return controllers.map(x => ({
      meta: Reflect.getMetadata(metaKey, x.ctorFunction) as T,
      discoveredClass: x
    }));
  }

  /**
   * Discovers all method handlers matching a particular metakey from a Provider or Controller
   * @param component
   * @param metaKey
   */
  methodMetaFromComponent<T>(
    component: DiscoveredClass,
    metaKey: MetaKey
  ): DiscoveredMethodMeta<T>[] {
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
  ): DiscoveredMethodMeta<T>[] {
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
  ): DiscoveredMethodMeta<T>[] {
    const controllers = this.controllers(controllerFilter);

    return flatMap(controllers, controller =>
      this.methodMetaFromComponent<T>(controller, metaKey)
    );
  }

  private discover(
    components: InternalComponent<any>[],
    filter: Filter<InstanceWrapper<any>>
  ) {
    return components
      .map(x => ({
        match: filter(x.component),
        internalComponent: x
      }))
      .filter(x => x.match)
      .map(x => {
        const { component, parentModule } = x.internalComponent;
        return {
          name: component.name as string,
          instance: component.instance,
          ctorFunction: component.metatype,
          parentModule: {
            name: parentModule.metatype.name,
            instance: parentModule.instance,
            ctorFunction: parentModule.metatype
          }
        };
      });
  }

  private extractMethodMeta<T>(
    metaKey: MetaKey,
    discoveredClass: DiscoveredClass,
    prototype: any,
    methodName: string
  ): DiscoveredMethodMeta<T> {
    const handler = prototype[methodName];
    const meta: T = Reflect.getMetadata(metaKey, handler);

    return {
      meta,
      discoveredMethod: {
        handler,
        methodName,
        parentClass: discoveredClass
      }
    };
  }
}
