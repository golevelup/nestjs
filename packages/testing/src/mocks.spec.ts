import { ExecutionContext } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from './mocks';

interface TestInterface {
  someNum: number;
  someBool: boolean;
  optional: string | undefined;
  func: (num: number, str: string) => boolean;
}

class TestClass {
  someProperty!: number;

  someMethod() {
    return 42;
  }
}

describe('Mocks', () => {
  const request = {
    headers: {
      authorization: 'auth',
    },
  };

  describe('user provided', () => {
    it('should convert user provided test object to mocks', () => {
      const request = {
        headers: {
          authorization: 'auth',
        },
      };
      const mock = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      });

      const result = mock.switchToHttp().getRequest();

      expect(result).toBe(request);
      expect(mock.switchToHttp).toBeCalledTimes(1);
    });

    it('should work with truthy values properties', () => {
      const mock = createMock<TestInterface>({
        someNum: 1,
        someBool: true,
      });

      expect(mock.someNum).toBe(1);
      expect(mock.someBool).toBe(true);
    });

    it('should work with falsy values properties', () => {
      const mock = createMock<TestInterface>({
        someNum: 0,
        someBool: false,
      });

      expect(mock.someNum).toBe(0);
      expect(mock.someBool).toBe(false);
    });

    it('should work with optional values explicitly returning undefined', () => {
      const mock = createMock<TestInterface>({
        optional: undefined,
      });

      expect(mock.optional).toBe(undefined);
    });

    it('should work with properties and functions', () => {
      const mock = createMock<TestInterface>({
        someNum: 42,
        func: () => false,
      });

      const num = mock.someNum;
      expect(num).toBe(42);

      const funcResult = mock.func(42, '42');
      expect(funcResult).toBe(false);
      expect(mock.func).toBeCalledTimes(1);
      expect(mock.func).toBeCalledWith(42, '42');
    });

    it('should work with classes', () => {
      const mock = createMock<TestClass>(undefined, { name: 'TestClass' });

      mock.someMethod.mockReturnValueOnce(42);

      const result = mock.someMethod();
      expect(result).toBe(42);
    });

    it('should work with partial objects and potentially undefined methods', () => {
      type TypeWithOptionalProps = {
        maybe?: () => number;
        another: () => boolean;
      };

      const mock = createMock<TypeWithOptionalProps>();
      mock.maybe?.mockImplementationOnce(() => 42);

      const result = mock.maybe!();

      expect(result).toBe(42);
    });

    it('should work with promises', async () => {
      type TypeWithPromiseReturningFunctions = {
        doSomethingAsync: () => Promise<number>;
      };

      const mock = createMock<TypeWithPromiseReturningFunctions>({
        doSomethingAsync: async () => 42,
      });

      const result = await mock.doSomethingAsync();
      expect(result).toBe(42);
      expect(mock.doSomethingAsync).toBeCalledTimes(1);
    });

    it('should work with unknown properties', () => {
      class Base {
        field?: unknown;
      }

      class Test {
        get base(): Base {
          return undefined as any;
        }
      }

      const base = createMock<Base>();
      const test = createMock<Test>({
        base,
      });

      expect(test.base).toEqual(base);
    });
  });

  describe('auto mocked', () => {
    it('should auto mock functions that are not provided by user', () => {
      const mock = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      });

      const first = mock.switchToRpc();
      const second = mock.switchToRpc();
      const third = mock.switchToWs();

      expect(mock.switchToRpc).toBeCalledTimes(2);
      expect(mock.switchToWs).toBeCalledTimes(1);
      expect(first.getContext).toBeDefined();
      expect(second.getContext).toBeDefined();
      expect(third.getClient).toBeDefined();
    });

    it('should allow for mock implementation on automocked properties', () => {
      const executionContextMock = createMock<ExecutionContext>();
      const httpArgsHost = createMock<HttpArgumentsHost>({
        getRequest: () => request,
      });

      executionContextMock.switchToHttp.mockImplementation(() => httpArgsHost);

      const result = executionContextMock.switchToHttp().getRequest();
      expect(result).toBe(request);
      expect(httpArgsHost.getRequest).toBeCalledTimes(1);
    });

    it('should automock promises so that they are awaitable', async () => {
      type TypeWithPromiseReturningFunctions = {
        doSomethingAsync: () => Promise<number>;
      };

      const mock = createMock<TypeWithPromiseReturningFunctions>();

      const result = await mock.doSomethingAsync();
      expect(result).toBeDefined();
      expect(mock.doSomethingAsync).toBeCalledTimes(1);
    });

    it('should automock objects returned from automocks', () => {
      const mock = createMock<ExecutionContext>();

      mock.switchToHttp().getRequest.mockImplementation(() => request);

      const request1 = mock.switchToHttp().getRequest();
      const request2 = mock.switchToHttp().getRequest();
      expect(request1).toBe(request);
      expect(request2).toBe(request);

      expect(mock.switchToHttp).toBeCalledTimes(3);
      expect(mock.switchToHttp().getRequest).toBeCalledTimes(2);
    });

    it('should automock objects returned from automocks recursively', () => {
      interface One {
        getNumber: () => number;
      }

      interface Two {
        getOne: () => One;
      }

      interface Three {
        getTwo: () => Two;
      }

      const mock = createMock<Three>();

      mock.getTwo().getOne().getNumber.mockReturnValueOnce(42);

      const result = mock.getTwo().getOne().getNumber();

      expect(result).toBe(42);
    });
  });

  describe('Nest DI', () => {
    let module: TestingModule;
    let mockedProvider: DeepMocked<ExecutionContext>;
    let dependentProvider: { dependent: () => string };
    const diToken = Symbol('diToken');
    const dependentToken = Symbol('dependentToken');

    beforeEach(async () => {
      module = await Test.createTestingModule({
        providers: [
          {
            provide: diToken,
            useValue: createMock<ExecutionContext>({
              getType: () => 'something',
            }),
          },
          {
            inject: [diToken],
            provide: dependentToken,
            useFactory: (dep: DeepMocked<ExecutionContext>) => ({
              dependent: dep.getType,
            }),
          },
        ],
      }).compile();

      mockedProvider = module.get<DeepMocked<ExecutionContext>>(diToken);
      dependentProvider = module.get<{ dependent: () => string }>(
        dependentToken
      );
    });

    it('should correctly resolve mocked providers', async () => {
      const request = {
        key: 'val',
      };

      mockedProvider.switchToHttp.mockReturnValueOnce(
        createMock<HttpArgumentsHost>({
          getRequest: () => request,
        })
      );

      const mockResult = mockedProvider.switchToHttp().getRequest();
      expect(mockResult).toBe(request);

      const dependentResult = dependentProvider.dependent();
      expect(dependentResult).toBe('something');
    });
  });
});
