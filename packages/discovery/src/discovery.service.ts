import { Injectable } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { InstanceWrapper } from '@nestjs/core/injector/container';
import { Module } from '@nestjs/core/injector/module';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { flatMap, uniqBy } from 'lodash';
import {
  DiscoveredClass,
  DiscoveredClassWithMeta,
  DiscoveredMethodWithMeta,
  Filter,
  MetaKey
} from './discovery.interfaces';

/**
 * A filter that can be used to search for DiscoveredClasses in an App that contain meta attached to a
 * certain key
 * @param key The meta key to search for
 */
export const withMetaAtKey: (
  key: MetaKey
) => Filter<DiscoveredClass> = key => component =>
  Reflect.getMetadata(key, component.classType);

@Injectable()
export class DiscoveryService {
  private readonly discoveredControllers: Promise<DiscoveredClass[]>;
  private readonly discoveredProviders: Promise<DiscoveredClass[]>;

  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner
  ) {
    const modulesMap = [...this.modulesContainer.entries()];

    this.discoveredControllers = Promise.all(
      flatMap(modulesMap, ([key, nestModule]) => {
        const components = [...nestModule.routes.values()];
        return components.map(component =>
          this.toDiscoveredClass(nestModule, component)
        );
      })
    );

    this.discoveredProviders = Promise.all(
      flatMap(modulesMap, ([key, nestModule]) => {
        const components = [...nestModule.components.values()];
        return components.map(component =>
          this.toDiscoveredClass(nestModule, component)
        );
      })
    );
  }

  /**
   * Discovers all providers in a Nest App that match a filter
   * @param providerFilter
   */
  async providers(filter: Filter<DiscoveredClass>): Promise<DiscoveredClass[]> {
    return (await this.discoveredProviders).filter(x => filter(x));
  }

  /**
   * Discovers all controller methods that either directly have a certain meta key attached to them
   * or belong to a controller that has the same meta key attached to them
   * @param metaKey The meta key to scan for
   * @param metaFilter An optional filter for the contents of the meta object
   */
  async methodsAndControllerMethodsWithMetaAtKey<T>(
    metaKey: MetaKey,
    metaFilter: Filter<T> = meta => true
  ): Promise<DiscoveredMethodWithMeta<T>[]> {
    const controllersWithMeta = (await this.controllersWithMetaAtKey<T>(
      metaKey
    )).filter(x => metaFilter(x.meta));

    const methodsFromDecoratedControllers = flatMap(
      controllersWithMeta,
      controller => {
        return this.classMethodsWithMetaAtKey<T>(
          controller.discoveredClass,
          PATH_METADATA
        );
      }
    );

    const decoratedMethods = (await this.controllerMethodsWithMetaAtKey<T>(
      metaKey
    )).filter(x => metaFilter(x.meta));

    return uniqBy(
      [...methodsFromDecoratedControllers, ...decoratedMethods],
      x => x.discoveredMethod.handler
    );
  }

  /**
   * Discovers all providers in an App that have meta at a specific key and returns the provider(s) and associated meta
   * @param metaKey The metakey to scan for
   */
  async providersWithMetaAtKey<T>(
    metaKey: MetaKey
  ): Promise<DiscoveredClassWithMeta<T>[]> {
    const providers = await this.providers(withMetaAtKey(metaKey));

    return providers.map(x => ({
      meta: Reflect.getMetadata(metaKey, x.classType) as T,
      discoveredClass: x
    }));
  }

  /**
   * Discovers all controllers in a Nest App that match a filter
   * @param providerFilter
   */
  async controllers(
    filter: Filter<DiscoveredClass>
  ): Promise<DiscoveredClass[]> {
    return (await this.discoveredControllers).filter(x => filter(x));
  }

  /**
   * Discovers all controllers in an App that have meta at a specific key and returns the controller(s) and associated meta
   * @param metaKey The metakey to scan for
   */
  async controllersWithMetaAtKey<T>(
    metaKey: MetaKey
  ): Promise<DiscoveredClassWithMeta<T>[]> {
    const controllers = await this.controllers(withMetaAtKey(metaKey));

    return controllers.map(x => ({
      meta: Reflect.getMetadata(metaKey, x.classType) as T,
      discoveredClass: x
    }));
  }

  /**
   * Discovers all method handlers matching a particular metakey from a Provider or Controller
   * @param component
   * @param metaKey
   */
  classMethodsWithMetaAtKey<T>(
    component: DiscoveredClass,
    metaKey: MetaKey
  ): DiscoveredMethodWithMeta<T>[] {
    const { instance } = component;
    if (!instance) {
      console.log('hmmm');
    }
    const prototype = Object.getPrototypeOf(instance);

    return this.metadataScanner
      .scanFromPrototype(instance, prototype, name =>
        this.extractMethodMetaAtKey<T>(metaKey, component, prototype, name)
      )
      .filter(x => !!x.meta);
  }

  /**
   * Discovers all the methods that exist on providers in a Nest App that contain metadata under a specific key
   * @param metaKey The metakey to scan for
   * @param providerFilter A predicate used to limit the providers being scanned. Defaults to all providers in the app module
   */
  async providerMethodsWithMetaAtKey<T>(
    metaKey: MetaKey,
    providerFilter: Filter<DiscoveredClass> = x => true
  ): Promise<DiscoveredMethodWithMeta<T>[]> {
    const providers = await this.providers(providerFilter);

    return flatMap(providers, provider =>
      this.classMethodsWithMetaAtKey<T>(provider, metaKey)
    );
  }

  /**
   * Discovers all the methods that exist on controllers in a Nest App that contain metadata under a specific key
   * @param metaKey The metakey to scan for
   * @param controllerFilter A predicate used to limit the controllers being scanned. Defaults to all providers in the app module
   */
  async controllerMethodsWithMetaAtKey<T>(
    metaKey: MetaKey,
    controllerFilter: Filter<DiscoveredClass> = x => true
  ): Promise<DiscoveredMethodWithMeta<T>[]> {
    const controllers = await this.controllers(controllerFilter);

    return flatMap(controllers, controller =>
      this.classMethodsWithMetaAtKey<T>(controller, metaKey)
    );
  }

  private async toDiscoveredClass(
    nestModule: Module,
    component: InstanceWrapper<any>
  ): Promise<DiscoveredClass> {
    if (component.isPending) {
      console.log(component);
      // await new Promise((resolve, reject) => {
      //   setTimeout(() => resolve(42), 2000);
      // });

      const test = await component.done$;
    }

    return {
      name: component.name as string,
      instance: component.instance,
      classType: component.metatype,
      parentModule: {
        name: nestModule.metatype.name,
        instance: nestModule.instance,
        classType: nestModule.metatype
      }
    };
  }

  private extractMethodMetaAtKey<T>(
    metaKey: MetaKey,
    discoveredClass: DiscoveredClass,
    prototype: any,
    methodName: string
  ): DiscoveredMethodWithMeta<T> {
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
