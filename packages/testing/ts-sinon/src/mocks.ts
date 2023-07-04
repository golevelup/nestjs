import * as sinon from 'sinon';
import { SinonStub } from 'sinon';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : unknown extends T[P]
    ? T[P]
    : DeepPartial<T[P]>;
};

export type PartialFuncReturn<T> = {
  [K in keyof T]?: T[K] extends (...args: infer A) => infer U
    ? (...args: A) => PartialFuncReturn<U>
    : DeepPartial<T[K]>;
};

export type DeepMocked<T> = {
  [Key in keyof T]: T[Key] extends (...args: infer A) => infer U
    ? SinonStub & ((...args: A) => DeepMocked<U>)
    : T[Key];
} & T;

export type MockCreationOptions = {
  name?: string;
};

const createDeepMockProxy = (propName: string): SinonStub => {
  const proxyObject = new Proxy({}, createDeepMockHandler(propName));
  return sinon.stub().callsFake(() => proxyObject);
};

const createDeepMockHandler = (propName: string) => {
  const propertyCache = new Map<
    PropertyKey,
    SinonStub | DeepPartial<unknown>
  >();

  return {
    get: (targetObject: DeepPartial<unknown>, prop: PropertyKey) => {
      if (propertyCache.has(prop)) {
        return propertyCache.get(prop);
      }

      const targetProperty = targetObject[prop];
      let mockedProperty;

      if (prop in targetObject) {
        mockedProperty =
          typeof targetProperty === 'function' ? sinon.stub() : targetProperty;
      } else if (prop.toString() === 'then') {
        mockedProperty = undefined;
      } else {
        mockedProperty = createDeepMockProxy(propName);
      }

      propertyCache.set(prop, mockedProperty);

      return mockedProperty;
    },
  };
};

const createMockHandler = (name: string) => {
  const cache = new Map<PropertyKey, SinonStub | DeepPartial<unknown>>();

  return {
    get: (targetObject: DeepPartial<unknown>, prop: PropertyKey) => {
      if (
        prop === 'inspect' ||
        prop === 'then' ||
        (typeof prop === 'symbol' &&
          prop.toString() === 'Symbol(util.inspect.custom)')
      ) {
        return undefined;
      }

      if (cache.has(prop)) {
        return cache.get(prop);
      }

      const targetProperty = targetObject[prop];
      let mockedProp;

      if (prop in targetObject) {
        if (typeof targetProperty === 'function') {
          mockedProp = sinon.stub().callsFake(() => {
            const result = targetProperty();
            return typeof result === 'function' ? sinon.stub(result) : result;
          });
        } else {
          mockedProp = targetProperty;
        }
      } else if (prop === 'constructor') {
        mockedProp = () => undefined;
      } else {
        mockedProp = createDeepMockProxy(`${name}.${prop.toString()}`);
      }

      cache.set(prop, mockedProp);
      return mockedProp;
    },
  };
};

export const createMock = <T>(
  partialObject: PartialFuncReturn<T> = {},
  options: MockCreationOptions = {}
): DeepMocked<T> => {
  const { name = 'mock' } = options;
  const proxyObject = new Proxy(partialObject, createMockHandler(name));

  return proxyObject as DeepMocked<T>;
};
