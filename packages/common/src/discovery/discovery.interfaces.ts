import { Controller, Injectable } from '@nestjs/common/interfaces';
import { InstanceWrapper } from '@nestjs/core/injector/container';

export type ComponentWrapper =
  | InstanceWrapper<Injectable>
  | InstanceWrapper<Controller>;

export interface MethodMeta<T> {
  meta: T;
  handler: (...args: any[]) => any;
  methodName: string;
  component: ComponentWrapper;
}

export interface ComponentMeta<T> {
  meta: T;
  component: ComponentWrapper;
}

export type MetaKey = string | number | Symbol;

export type Filter<T> = (item: T) => boolean;
