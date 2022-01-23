import { Injectable, Scope, Type } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { STATIC_CONTEXT } from '@nestjs/core/injector/constants';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { flatMap, get, some, uniqBy } from 'lodash';
import {
  DiscoveredClass,
  DiscoveredClassWithMeta,
  DiscoveredMethodWithMeta,
  Filter,
  MetaKey,
} from './discovery.interfaces';

/**
 * Attempts to retrieve meta information from a Nest DiscoveredClass component
 * @param key The meta key to retrieve data from
 * @param component The discovered component to retrieve meta from
 */
export function getComponentMetaAtKey<T>(
  key: MetaKey,
  component: DiscoveredClass
): T | undefined {
  const dependencyMeta = Reflect.getMetadata(
    key,
    component.dependencyType
  ) as T;
  if (dependencyMeta) {
    return dependencyMeta;
  }

  if (component.injectType != null) {
    return Reflect.getMetadata(key, component.injectType) as T;
  }
}

/**
 * A filter that can be used to search for DiscoveredClasses in an App that contain meta attached to a
 * certain key
 * @param key The meta key to search for
 */
export const withMetaAtKey: (key: MetaKey) => Filter<DiscoveredClass> =
  (key) => (component) => {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const metaTargets: Function[] = [
      get(component, 'instance.constructor'),
      // eslint-disable-next-line @typescript-eslint/ban-types
      component.injectType as Function,
    ].filter((x) => x != null);

    return some(metaTargets, (x) => Reflect.getMetadata(key, x));
  };

@Injectable()
export class DiscoveryService {
  private discoveredControllers?: Promise<DiscoveredClass[]>;
  private discoveredProviders?: Promise<DiscoveredClass[]>;

  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner
  ) {}

  /**
   * Discovers all providers in a Nest App that match a filter
   * @param filter
   */
  async providers(filter: Filter<DiscoveredClass>): Promise<DiscoveredClass[]> {
    if (!this.discoveredProviders) {
      this.discoveredProviders = this.discover('providers');
    }
    return (await this.discoveredProviders).filter((x) => filter(x));
  }

  /**
   * Discovers all controller methods that either directly have a certain meta key attached to them
   * or belong to a controller that has the same meta key attached to them
   * @param metaKey The meta key to scan for
   * @param metaFilter An optional filter for the contents of the meta object
   */
  async methodsAndControllerMethodsWithMetaAtKey<T>(
    metaKey: MetaKey,
    metaFilter: Filter<T> = () => true
  ): Promise<DiscoveredMethodWithMeta<T>[]> {
    const controllersWithMeta = (
      await this.controllersWithMetaAtKey<T>(metaKey)
    ).filter((x) => metaFilter(x.meta));

    const methodsFromDecoratedControllers = flatMap(
      controllersWithMeta,
      (controller) => {
        return this.classMethodsWithMetaAtKey<T>(
          controller.discoveredClass,
          PATH_METADATA
        );
      }
    );

    const decoratedMethods = (
      await this.controllerMethodsWithMetaAtKey<T>(metaKey)
    ).filter((x) => metaFilter(x.meta));

    return uniqBy(
      [...methodsFromDecoratedControllers, ...decoratedMethods],
      (x) => x.discoveredMethod.handler
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

    return providers.map((x) => ({
      meta: getComponentMetaAtKey<T>(metaKey, x) as T,
      discoveredClass: x,
    }));
  }

  /**
   * Discovers all controllers in a Nest App that match a filter
   * @param filter
   */
  async controllers(
    filter: Filter<DiscoveredClass>
  ): Promise<DiscoveredClass[]> {
    if (!this.discoveredControllers) {
      this.discoveredControllers = this.discover('controllers');
    }
    return (await this.discoveredControllers).filter((x) => filter(x));
  }

  /**
   * Discovers all controllers in an App that have meta at a specific key and returns the controller(s) and associated meta
   * @param metaKey The metakey to scan for
   */
  async controllersWithMetaAtKey<T>(
    metaKey: MetaKey
  ): Promise<DiscoveredClassWithMeta<T>[]> {
    const controllers = await this.controllers(withMetaAtKey(metaKey));

    return controllers.map((x) => ({
      meta: getComponentMetaAtKey<T>(metaKey, x) as T,
      discoveredClass: x,
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
      return [];
    }

    const prototype = Object.getPrototypeOf(instance);

    return this.metadataScanner
      .scanFromPrototype(instance, prototype, (name) =>
        this.extractMethodMetaAtKey<T>(metaKey, component, prototype, name)
      )
      .filter((x) => !!x.meta);
  }

  /**
   * Discovers all the methods that exist on providers in a Nest App that contain metadata under a specific key
   * @param metaKey The metakey to scan for
   * @param providerFilter A predicate used to limit the providers being scanned. Defaults to all providers in the app module
   */
  async providerMethodsWithMetaAtKey<T>(
    metaKey: MetaKey,
    providerFilter: Filter<DiscoveredClass> = () => true
  ): Promise<DiscoveredMethodWithMeta<T>[]> {
    const providers = await this.providers(providerFilter);

    return flatMap(providers, (provider) =>
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
    controllerFilter: Filter<DiscoveredClass> = () => true
  ): Promise<DiscoveredMethodWithMeta<T>[]> {
    const controllers = await this.controllers(controllerFilter);

    return flatMap(controllers, (controller) =>
      this.classMethodsWithMetaAtKey<T>(controller, metaKey)
    );
  }

  private async toDiscoveredClass(
    nestModule: Module,
    wrapper: InstanceWrapper<any>
  ): Promise<DiscoveredClass> {
    const instanceHost = wrapper.getInstanceByContextId(
      STATIC_CONTEXT,
      wrapper && wrapper.id ? wrapper.id : undefined
    );

    if (instanceHost.isPending && !instanceHost.isResolved) {
      await instanceHost.donePromise;
    }

    return {
      name: wrapper.name as string,
      instance: instanceHost.instance,
      injectType: wrapper.metatype,
      dependencyType: get(instanceHost, 'instance.constructor'),
      parentModule: {
        name: nestModule.metatype.name,
        instance: nestModule.instance,
        injectType: nestModule.metatype,
        dependencyType: nestModule.instance.constructor as Type<object>,
      },
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
        parentClass: discoveredClass,
      },
    };
  }

  private async discover(component: 'providers' | 'controllers') {
    const modulesMap = [...this.modulesContainer.entries()];
    return Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      flatMap(modulesMap, ([key, nestModule]) => {
        const components = [...nestModule[component].values()];
        return components
          .filter((component) => component.scope !== Scope.REQUEST)
          .map((component) => this.toDiscoveredClass(nestModule, component));
      })
    );
  }
}
