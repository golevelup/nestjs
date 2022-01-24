import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';

export const makeInjectableMixin = (name: string) => (mixinClass) => {
  Object.defineProperty(mixinClass, 'name', {
    value: `${name}-${nanoid()}`,
  });
  Injectable()(mixinClass);
  return mixinClass;
};
