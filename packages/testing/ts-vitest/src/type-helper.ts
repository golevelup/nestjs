/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { Mock } from 'vitest';

/**
 * Recursively makes all properties of a type optional and applies the same transformation
 * to nested objects. Arrays are preserved but their elements are made deeply partial.
 * Unknown types are left as-is since we can't make assumptions about their structure.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : unknown extends T[P]
        ? T[P]
        : DeepPartial<T[P]>;
};

/**
 * Type for the partial object passed to createMock. All properties are optional.
 * - Functions can be provided as implementations OR as already-mocked DeepMocked functions
 *   (enabling mock composition - passing pre-built mocks to other mocks)
 * - Non-function properties can be partial values OR already-mocked DeepMocked objects
 * This dual support prevents double-wrapping and allows flexible mock composition.
 */
export type PartialFuncReturn<T> = {
  [K in keyof T]?: T[K] extends (...args: infer A) => infer U
    ? ((...args: A) => PartialFuncReturn<U>) | DeepMocked<T[K]>
    : DeepPartial<T[K]> | DeepMocked<T[K]>;
};

/**
 * Detects if a type is exactly `unknown` (not `any` or other types).
 */
export type IsExactlyUnknown<T> = unknown extends T
  ? T extends {}
    ? false
    : true
  : false;

/**
 * Helper type for mocked functions with deep mocked return types.
 */
export type DeepMockedFunction<
  T extends (...args: any[]) => any,
  D extends keyof Prev & number = 4,
> = ((...args: Parameters<T>) => DeepMockedInternal<ReturnType<T>, D>) &
  Mock<T>;

// Tuple used to decrement the depth counter at the type level.
type Prev = [never, 0, 1, 2, 3, 4];

// Internal recursive implementation. The depth counter `D` prevents unbounded
// type instantiation on complex SDK types (e.g. S3Client, PrismaClient) that
// would cause type-checking performance regressions.
type DeepMockedInternal<T, D extends keyof Prev & number> = D extends 0
  ? T
  : {
      [K in keyof T]: IsExactlyUnknown<T[K]> extends true
        ? any
        : NonNullable<T[K]> extends (...args: any[]) => any
          ? undefined extends T[K]
            ? DeepMockedFunction<NonNullable<T[K]>, Prev[D]> | undefined
            : DeepMockedFunction<NonNullable<T[K]>, Prev[D]>
          : NonNullable<T[K]> extends object
            ? undefined extends T[K]
              ? DeepMockedInternal<NonNullable<T[K]>, Prev[D]> | undefined
              : DeepMockedInternal<T[K], Prev[D]>
            : T[K]; // primitive
    } & T;

/**
 * Recursively transforms a type into a deeply mocked version.
 * Each property is handled based on its type:
 *
 * 1. Unknown types (e.g., Record<string, unknown>):
 *    - Become `any` to support dynamic proxy access
 *    - Enables `mock.anything.nested.deeply` without type errors
 *
 * 2. Functions:
 *    - Wrapped with DeepMockedFunction to provide Mock methods
 *    - Return types are recursively DeepMockedType
 *    - Optional functions preserve their optionality (union with undefined)
 *    - Example: `mock.getUser()` returns DeepMockedType<User> with all Mock methods
 *
 * 3. Objects:
 *    - Recursively transformed to DeepMockedType
 *    - Optional objects preserve their optionality
 *    - Example: `mock.nested.property` is also deeply mocked
 *
 * 4. Primitives (string, number, boolean, etc.):
 *    - Left as-is since they can't have nested properties
 */
export type DeepMocked<T> = DeepMockedInternal<T, 4>;
