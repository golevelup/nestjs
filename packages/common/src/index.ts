import { Injectable } from '@nestjs/common';
import { generate } from 'shortid';

export const makeInjectableMixin = (name: string) => mixinClass => {
  Object.defineProperty(mixinClass, 'name', {
    value: `${name}-${generate()}`
  });
  Injectable()(mixinClass);
  return mixinClass;
};
