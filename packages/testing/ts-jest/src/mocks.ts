import { jest } from '@jest/globals';
import { Mock } from 'jest-mock';

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
  [K in keyof T]: Required<T>[K] extends (...args: any[]) => infer U
    ? jest.MockInstance<ReturnType<Required<T>[K]>, jest.ArgsType<T[K]>> &
        ((...args: jest.ArgsType<T[K]>) => DeepMocked<U>)
    : T[K];
} & T;

const jestFnProps = new Set([
  '_isMockFunction',
  'mock',
  'mockClear',
  'mockImplementation',
  'mockImplementationOnce',
  'mockName',
  'getMockName',
  'getMockImplementation',
  'mockRejectedValue',
  'mockRejectedValueOnce',
  'mockReset',
  'mockResolvedValue',
  'mockResolvedValueOnce',
  'mockRestore',
  'mockReturnThis',
  'mockReturnValue',
  'mockReturnValueOnce',
  'withImplementation',
  'calls',
]);

const createProxy: {
  <T extends object>(name: string, strict: boolean, base: T): T;
  <T extends Mock<any, any> = Mock<any, any>>(name: string, strict: boolean): T;
} = <T extends object | Mock<any, any>>(name: string, strict: boolean, base?: T): T => {
  const cache = new Map<string | number | symbol, any>();
  const handler: ProxyHandler<T> = {
    get: (obj, prop, receiver) => {
      const propName = prop.toString();

      if (
        prop === 'inspect' ||
        prop === 'then' ||
        prop === 'asymmetricMatch' ||
        (typeof prop === 'symbol' && propName === 'Symbol(util.inspect.custom)')
      ) {
        return undefined;
      }

      if (!base && jestFnProps.has(propName)) {
        return Reflect.get(obj, prop, receiver);
      }

      if (cache.has(prop)) {
        return cache.get(prop);
      }

      const checkProp = obj[prop];

      let mockedProp: any;

      if (prop in obj) {
        mockedProp =
          typeof checkProp === 'function' ? jest.fn(checkProp) : checkProp;
      } else if (prop === 'constructor') {
        mockedProp = () => undefined;
      } else {
        mockedProp = createProxy(`${name}.${propName}`, strict);
      }

      cache.set(prop, mockedProp);
      return mockedProp;
    },
    set: (obj, prop, newValue) => {
      cache.set(prop, newValue);

      return Reflect.set(obj, prop, newValue);
    },
  };
  if (!base) {
    (handler as ProxyHandler<Mock<any, any>>).apply = (
      target,
      thisArg,
      argsArray,
    ) => {
      const result = Reflect.apply(target, thisArg, argsArray);
      if (target.getMockImplementation() || result !== undefined) {
        return result;
      } else {
        if (strict) {
          throw new Error(`Method ${name} was called without being explicitly stubbed`);
        }
        if (!cache.has('__apply')) {
          cache.set('__apply', createProxy(name, strict));
        }
        return cache.get('__apply');
      }
    };
  }
  return new Proxy(base || (jest.fn() as T), handler);
};

export type MockOptions = {
  name?: string;
  strict?: boolean;
};

export const createMock = <T extends object>(
  partial: PartialFuncReturn<T> = {},
  options: MockOptions = {},
): DeepMocked<T> => {
  const { name = 'mock', strict = false } = options;
  const proxy = createProxy<T>(name, strict, partial as T);
  return proxy as DeepMocked<T>;
};
