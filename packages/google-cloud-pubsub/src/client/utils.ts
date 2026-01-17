export type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
};

export function promiseWithResolvers<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: any) => void;

  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return { promise, resolve, reject };
}
