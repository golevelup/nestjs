export type PartialFuncReturn<T> = {
  [K in keyof T]?: T[K] extends (...args: infer A) => infer U
    ? (...args: A) => PartialFuncReturn<U>
    : T[K]
};

type DeepMocked<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => infer U
    ? jest.MockInstance<ReturnType<T[K]>, jest.ArgsType<T[K]>> &
        ((...args: jest.ArgsType<T[K]>) => DeepMocked<U>)
    : T[K]
} &
  T;

const makeRecursiveMockProxy = (partial: {} = {}) => {
  const cache = new Map<string | number | symbol, any>();

  const proxy = new Proxy(partial, {
    get: (obj, prop) => {
      if (cache.has(prop)) {
        return cache.get(prop);
      }

      const anyObj = obj as any;
      const checkProp = anyObj[prop];
      if (checkProp) {
        const mockedProp =
          typeof checkProp === 'function' ? jest.fn(checkProp) : checkProp;

        cache.set(prop, mockedProp);
        return mockedProp;
      } else {
        const mockedProp = makeRecursiveMockProxy();
        cache.set(prop, mockedProp);
        return mockedProp;
      }
    }
  });

  return jest.fn(() => proxy);
};

export const makeMock = <T>(
  partial: PartialFuncReturn<T> = {}
): DeepMocked<T> => {
  const cache = new Map<string | number | symbol, any>();

  const proxy = new Proxy(partial, {
    get: (obj, prop) => {
      if (cache.has(prop)) {
        return cache.get(prop);
      }

      const anyObj = obj as any;
      const checkProp = anyObj[prop];
      if (checkProp) {
        const mockedProp =
          typeof checkProp === 'function' ? jest.fn(checkProp) : checkProp;

        cache.set(prop, mockedProp);
        return mockedProp;
      } else {
        const mockedProp = makeRecursiveMockProxy();
        cache.set(prop, mockedProp);
        return mockedProp;
      }
    }
  });

  return <DeepMocked<T>>(proxy as any);
};
