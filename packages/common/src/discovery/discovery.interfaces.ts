import { Injectable } from '@nestjs/common/interfaces';
import { InstanceWrapper } from '@nestjs/core/injector/container';

export interface MethodMeta<T> {
  meta: T;
  handler: (...args: any[]) => any;
  methodName: string;
  provider: InstanceWrapper<Injectable>;
}

export interface ProviderMeta<T> {
  meta: T;
  provider: InstanceWrapper<Injectable>;
}

export type MetaKey = string | number | Symbol;

export type ProviderFilter = (
  injectableWrapper: InstanceWrapper<Injectable>
) => boolean;
