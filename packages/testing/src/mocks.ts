export type PartialFuncReturn<T> = {
  [K in keyof T]?: T[K] extends (...args: infer A) => infer U
    ? (...args: A) => PartialFuncReturn<U>
    : T[K]
};

export type DeepMocked<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => infer U
    ? jest.MockInstance<ReturnType<T[K]>, jest.ArgsType<T[K]>> &
        ((...args: jest.ArgsType<T[K]>) => DeepMocked<U>)
    : T[K]
} &
  T;

const createRecursiveMockProxy = (partial: {} = {}) => {
  const cache = new Map<string | number | symbol, any>();

  const proxy = new Proxy(partial, {
    get: (obj, prop) => {
      if (cache.has(prop)) {
        return cache.get(prop);
      }

      const checkProp = obj[prop];

      const mockedProp = checkProp
        ? typeof checkProp === 'function'
          ? jest.fn()
          : checkProp
        : createRecursiveMockProxy();

      cache.set(prop, mockedProp);
      return mockedProp;
    }
  });

  return jest.fn(() => proxy);
};

export const createMock = <T>(
  partial: PartialFuncReturn<T> = {}
): DeepMocked<T> => {
  const cache = new Map<string | number | symbol, any>();

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

      const mockedProp = checkProp
        ? typeof checkProp === 'function'
          ? jest.fn(checkProp)
          : checkProp
        : createRecursiveMockProxy();

      cache.set(prop, mockedProp);
      return mockedProp;
    }
  });

  return <DeepMocked<T>>(proxy as any);
};
