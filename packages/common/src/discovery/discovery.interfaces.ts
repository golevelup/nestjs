import { Type } from '@nestjs/common';

// export type ComponentWrapper =
//   | InstanceWrapper<Injectable>
//   | InstanceWrapper<Controller>;

// export interface MethodMeta<T> {
//   meta: T;
//   handler: (...args: any[]) => any;
//   methodName: string;
//   component: ComponentWrapper;
// }

export interface DiscoveredModule {
  name: string;
  instance: {};
  ctorFunction: Type<{}>;
}

export interface DiscoveredClass extends DiscoveredModule {
  parentModule: DiscoveredModule;
}

export interface DiscoveredMethod {
  handler: (...args: any[]) => any;
  methodName: string;
  parentClass: DiscoveredClass;
}

export interface DiscoveredMethodMeta<T> {
  discoveredMethod: DiscoveredMethod;
  meta: T;
}

export interface DiscoveredClassMeta<T> {
  discoveredClass: DiscoveredClass;
  meta: T;
}

// export interface ComponentMeta<T> {
//   meta: T;
//   component: ComponentWrapper;
// }

export type MetaKey = string | number | Symbol;

export type Filter<T> = (item: T) => boolean;
