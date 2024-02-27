import { ArgumentsType, MockInstance, vi, Mock } from 'vitest';

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
    ? MockInstance<ArgumentsType<T[K]>, ReturnType<Required<T>[K]>> &
        ((...args: ArgumentsType<T[K]>) => DeepMocked<U>)
    : T[K];
} & T;

const createRecursiveMockProxy = (name: string) => {
  const cache = new Map<string | number | symbol, any>();

  const proxy = new Proxy(
    {},
    {
      get: (obj, prop) => {
        const propName = prop.toString();
        if (cache.has(prop)) {
          return cache.get(prop);
        }

        const checkProp = obj[prop];

        const mockedProp =
          prop in obj
            ? typeof checkProp === 'function'
              ? vi.fn()
              : checkProp
            : propName === 'then'
            ? undefined
            : createRecursiveMockProxy(propName);

        cache.set(prop, mockedProp);

        return mockedProp;
      },
    }
  );

  return vi.fn(() => proxy);
};

export type MockOptions = {
  name?: string;
};

export const createMock = <T extends object>(
  partial: PartialFuncReturn<T> = {},
  options: MockOptions = {}
): DeepMocked<T> => {
  const cache = new Map<string | number | symbol, any>();
  const { name = 'mock' } = options;

  const proxy = new Proxy(partial, {
    get: (obj, prop) => {
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

      const checkProp = obj[prop];

      let mockedProp: any;

      if (prop in obj) {
        mockedProp =
          typeof checkProp === 'function' ? vi.fn(checkProp) : checkProp;
      } else if (prop === 'constructor') {
        mockedProp = () => undefined;
      } else {
        mockedProp = createRecursiveMockProxy(`${name}.${prop.toString()}`);
      }

      cache.set(prop, mockedProp);
      return mockedProp;
    },
  });

  return proxy as DeepMocked<T>;
};
