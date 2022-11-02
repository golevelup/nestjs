type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : (unknown extends T[P] ? T[P] : DeepPartial<T[P]>);
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
} &
  T;

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
              ? jest.fn()
              : checkProp
            : propName === 'then'
            ? undefined
            : createRecursiveMockProxy(propName);

        cache.set(prop, mockedProp);

        return mockedProp;
      },
    }
  );

  return jest.fn(() => proxy);
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
        prop === 'constructor' ||
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

      const mockedProp =
        prop in obj
          ? typeof checkProp === 'function'
            ? jest.fn(checkProp)
            : checkProp
          : createRecursiveMockProxy(`${name}.${prop.toString()}`);

      cache.set(prop, mockedProp);
      return mockedProp;
    },
  });

  return proxy as DeepMocked<T>;
};
