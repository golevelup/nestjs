import { ExecutionContext } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { createMock } from './mocks';

interface TestInterface {
  someNum: number;
  func: (num: number, str: string) => boolean;
}

describe('Mocks', () => {
  const request = {
    headers: {
      authorization: 'auth'
    }
  };

  describe('user provided', () => {
    it('should convert user provided test object to mocks', () => {
      const request = {
        headers: {
          authorization: 'auth'
        }
      };
      const mock = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => request
        })
      });

      const result = mock.switchToHttp().getRequest();

      expect(result).toBe(request);
      expect(mock.switchToHttp).toBeCalledTimes(1);
    });

    it('should work with properties and functions', () => {
      const mock = createMock<TestInterface>({
        someNum: 42,
        func: (arg1, arg2) => false
      });

      const num = mock.someNum;
      expect(num).toBe(42);

      const funcResult = mock.func(42, '42');
      expect(funcResult).toBe(false);
      expect(mock.func).toBeCalledTimes(1);
      expect(mock.func).toBeCalledWith(42, '42');
    });
  });

  describe('auto mocked', () => {
    it('should auto mock functions that are not provided by user', () => {
      const mock = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => request
        })
      });

      const first = mock.switchToRpc();
      const second = mock.switchToRpc();
      const third = mock.switchToWs();

      expect(mock.switchToRpc).toBeCalledTimes(2);
      expect(mock.switchToWs).toBeCalledTimes(1);
    });

    it('should allow for mock implementation on automocked properties', () => {
      const executionContextMock = createMock<ExecutionContext>();
      const httpArgsHost = createMock<HttpArgumentsHost>({
        getRequest: () => request
      });

      executionContextMock.switchToHttp.mockImplementation(() => httpArgsHost);

      const result = executionContextMock.switchToHttp().getRequest();
      expect(result).toBe(request);
      expect(httpArgsHost.getRequest).toBeCalledTimes(1);
    });

    it('should automock objects returned from automocks', () => {
      const mock = createMock<ExecutionContext>();

      mock.switchToHttp().getRequest.mockImplementation(() => request);

      const request1 = mock.switchToHttp().getRequest();
      const request2 = mock.switchToHttp().getRequest();
      expect(request1).toBe(request);

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

      mock
        .getTwo()
        .getOne()
        .getNumber.mockReturnValueOnce(42);

      const result = mock
        .getTwo()
        .getOne()
        .getNumber();

      expect(result).toBe(42);
    });
  });
});
