import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

export const makeInjectableMixin = (name: string) => (mixinClass) => {
  Object.defineProperty(mixinClass, 'name', {
    value: `${name}-${randomUUID()}`,
  });
  Injectable()(mixinClass);
  return mixinClass;
};
