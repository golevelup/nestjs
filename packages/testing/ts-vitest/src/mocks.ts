import type { Mock } from 'vitest';
import { vi } from 'vitest';
import { DeepMocked, PartialFuncReturn } from './type-helper.js';

/**
 * Set of property names that are part of Vitest's Mock function API. These keys are handled directly by the underlying vi.fn() mock instance and should not be intercepted by our proxy. This ensures that all Vitest mock methods (like mockImplementation, mockReset, etc.) work as expected.
 */
const vitestMockFunctionKeys = new Set([
  'getMockName',
  'mock',
  'mockClear',
  'mockImplementation',
  'mockImplementationOnce',
  'mockName',
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

/**
 * Creates a Proxy that enables deep mocking with automatic property generation.
 *
 * @param name - Debug name for the mock (used in error messages)
 * @param strict - If true, throws errors when calling unstubbed methods
 * @param base - Optional base object with pre-defined properties/implementations
 * @returns A proxied object that auto-generates mocks for any accessed property
 */
const createProxy: {
  <T extends object>(name: string, strict: boolean, base: T): T;
  <T extends Mock = Mock>(name: string, strict: boolean): T;
} = <T extends object | Mock>(name: string, strict: boolean, base?: T): T => {
  const cache = new Map<string | number | symbol, any>();

  const handler: ProxyHandler<T> = {
    get: (obj, prop, receiver) => {
      const propName = prop.toString();

      // Return undefined for special properties to prevent interference:
      // - 'inspect' & Symbol(util.inspect.custom): Node.js inspection (console.log)
      // - 'then': Prevents mocks from being treated as Promises
      // - 'asymmetricMatch': Prevents interference with Vitest's asymmetric matchers
      if (
        prop === 'inspect' ||
        prop === 'then' ||
        prop === 'asymmetricMatch' ||
        (typeof prop === 'symbol' && propName === 'Symbol(util.inspect.custom)')
      ) {
        return undefined;
      }

      // For auto-mocked functions (no base), allow direct access to Vitest Mock API properties
      // This ensures methods like mockImplementation work correctly
      if (!base && vitestMockFunctionKeys.has(propName)) {
        return Reflect.get(obj, prop, receiver);
      }

      // Return cached value if we've already created a mock for this property
      // Ensures consistency: accessing mock.foo twice returns the same mock
      if (cache.has(prop)) {
        return cache.get(prop);
      }

      const checkProp = (obj as any)[prop];

      let mockedProp: any;

      if (prop in obj) {
        // Property exists in the base object
        // Check for functions - don't double-wrap already mocked functions
        if (typeof checkProp === 'function') {
          // If it's already a vi.fn() mock (from mock composition), use it as-is
          // Otherwise wrap it with vi.fn() to track calls
          mockedProp = vi.isMockFunction(checkProp)
            ? checkProp
            : vi.fn(checkProp);
        } else {
          // Non-function property, use the value directly
          mockedProp = checkProp;
        }
      } else {
        // Property doesn't exist - auto-generate a nested mock
        // This enables deep access like mock.nested.deeply.whatever
        mockedProp = createProxy(`${name}.${propName}`, strict);
      }

      // Cache the mocked property for consistent return values
      cache.set(prop, mockedProp);

      return mockedProp;
    },
    set: (obj, prop, newValue) => {
      // Update both the cache and the underlying object
      // This allows mock properties to be reassigned: mock.foo = 42
      cache.set(prop, newValue);

      return Reflect.set(obj, prop, newValue);
    },
  };

  // For auto-mocked functions (no base), add apply trap to handle function calls
  if (!base) {
    (handler as ProxyHandler<Mock>).apply = (target, thisArg, argsArray) => {
      const result = Reflect.apply(target, thisArg, argsArray);

      // If the function has a user-provided implementation or returned a value, use it
      if (target.getMockImplementation() || result !== undefined) {
        return result;
      }

      // Strict mode: throw error if function is called without being stubbed
      if (strict) {
        throw new Error(
          `Method ${name} was called without being explicitly stubbed`,
        );
      }

      // Auto-generate a mock for the return value
      // Cache it so repeated calls return the same mock object
      if (!cache.has('__apply')) {
        cache.set('__apply', createProxy(name, strict));
      }

      return cache.get('__apply');
    };
  }
  return new Proxy(base || (vi.fn() as T), handler);
};

export type MockOptions = {
  /**
   * Debug name for the mock, used in error messages
   *
   * @default mock
   */
  name?: string;
  /**
   * If true, throws errors when calling unstubbed methods
   *
   * @default false
   */
  strict?: boolean;
};

/**
 * Creates a deep mock of the specified type with Vitest.
 *
 * Features:
 * - All properties and methods are automatically mocked
 * - Nested properties are also deeply mocked (e.g., `mock.user.address.city`)
 * - Function return values are automatically mocked and awaitable
 * - Supports mock composition: pass existing mocks as partial values
 * - All functions are Vitest mocks with full Mock API support
 *
 * @param partial - Optional object with pre-defined properties/implementations
 * @param options - Optional configuration (name, strict mode)
 * @returns A deeply mocked version of T with all Mock methods available
 *
 * @example
 * ```typescript
 * interface User {
 *   getName: () => string;
 *   getAddress: () => { city: string };
 * }
 *
 * // Auto-mocked
 * const user = createMock<User>();
 * user.getName.mockReturnValue('John');
 * user.getAddress().city; // Automatically mocked
 *
 * // With partial implementation
 * const user = createMock<User>({
 *   getName: () => 'John'
 * });
 *
 * // Mock composition
 * const address = createMock<Address>({ city: 'NYC' });
 * const user = createMock<User>({
 *   getAddress: () => address
 * });
 * ```
 */
export const createMock = <T extends object>(
  partial: PartialFuncReturn<T> = {},
  options: MockOptions = {},
): DeepMocked<T> => {
  const { name = 'mock', strict = false } = options;
  const proxy = createProxy<T>(name, strict, partial as T);

  return proxy as DeepMocked<T>;
};
