import { ExecutionContext } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from './mocks';

interface TestInterface {
  someNum: number;
  someBool: boolean;
  optional: string | undefined;
  func: (num: number, str: string) => boolean;
  func2: (entity: TestClass) => void;
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
      expect(mock.switchToHttp).toHaveBeenCalledTimes(1);
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
      expect(mock.func).toHaveBeenCalledTimes(1);
      expect(mock.func).toHaveBeenCalledWith(42, '42');
    });

    it('should allow mocked properties to be reassigned', () => {
      const mock = createMock<TestInterface>();

      mock.someNum = 42;
      expect(mock.someNum).toBe(42);

      mock.someNum = 43;
      expect(mock.someNum).toBe(43);
    });

    it('should match mocked instances', () => {
      const mock = createMock<TestInterface>();
      const mockedInstance = createMock<TestClass>({ someProperty: 42 });

      mock.func2(mockedInstance);
      expect(mock.func2).toHaveBeenCalledWith(mockedInstance);

      // In a previous version a bug caused all checks to pass, no matter which parameter was asserted
      // These tests shall help avoiding regressions
      expect(mock.func2).not.toHaveBeenCalledWith(42);
      expect(mock.func2).not.toHaveBeenCalledWith('42');
      expect(mock.func2).not.toHaveBeenCalledWith(true);
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
      expect(mock.doSomethingAsync).toHaveBeenCalledTimes(1);
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

    it('should accept mocks returning nullables', async () => {
      interface Test {
        foo(): number | undefined;
      }

      const mock = createMock<Test>();
      mock.foo.mockImplementation(() => {
        return 0;
      });
      expect(mock.foo()).toEqual(0);
      mock.foo.mockImplementation(() => {
        return undefined;
      });
      expect(mock.foo()).toEqual(undefined);
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

      expect(mock.switchToRpc).toHaveBeenCalledTimes(2);
      expect(mock.switchToWs).toHaveBeenCalledTimes(1);
      expect(first.getContext).toBeDefined();
      expect(second.getContext).toBeDefined();
      expect(third.getClient).toBeDefined();
    });

    it('toString should work', () => {
      const mock = createMock<any>();
      expect(mock.toString()).toEqual('[object Object]');
      expect(mock.nested.toString()).toEqual('function () { [native code] }');
    });

    it('nested properties mocks should be able to set properties and override cache', () => {
      const mock = createMock<any>();
      const autoMockedFn = mock.nested.f;
      expect(typeof autoMockedFn).toEqual('function');
      const myFn = () => 5;
      mock.nested.f = myFn;
      expect(mock.nested.f === myFn).toBeTruthy();
    });

    it('should allow for mock implementation on automocked properties', () => {
      const executionContextMock = createMock<ExecutionContext>();
      const httpArgsHost = createMock<HttpArgumentsHost>({
        getRequest: () => request,
      });

      executionContextMock.switchToHttp.mockImplementation(() => httpArgsHost);

      const result = executionContextMock.switchToHttp().getRequest();
      expect(result).toBe(request);
      expect(httpArgsHost.getRequest).toHaveBeenCalledTimes(1);
    });

    it('should automock promises so that they are awaitable', async () => {
      type TypeWithPromiseReturningFunctions = {
        doSomethingAsync: () => Promise<number>;
      };

      const mock = createMock<TypeWithPromiseReturningFunctions>();

      const result = await mock.doSomethingAsync();
      expect(result).toBeDefined();
      expect(mock.doSomethingAsync).toHaveBeenCalledTimes(1);
    });

    it('should automock objects returned from automocks', () => {
      const mock = createMock<ExecutionContext>();

      mock.switchToHttp().getRequest.mockImplementation(() => request);

      const request1 = mock.switchToHttp().getRequest();
      const request2 = mock.switchToHttp().getRequest();
      expect(request1).toBe(request);
      expect(request2).toBe(request);

      expect(mock.switchToHttp).toHaveBeenCalledTimes(3);
      expect(mock.switchToHttp().getRequest).toHaveBeenCalledTimes(2);
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

    describe(`constructor`, () => {
      it('should have constructor defined', () => {
        class Service {}

        const mock = createMock<Service>();

        expect(mock.constructor).toBeDefined();
      });

      it('should have the same constructor defined', () => {
        class Service {}

        const mock = createMock<Service>();

        expect(mock.constructor).toEqual(mock.constructor);
      });

      it(`should allow mocks to be equal`, () => {
        class Service {}

        const comparable = createMock<Service>();

        expect([comparable]).toEqual([comparable]);
      });
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
