# Jest Mocking (ts-jest)

With `@golevelup/ts-jest` `createMock` utility function, you can easily generate deeply nested mock objects for unit
testing, especially useful for mocking complex types like those found in NestJS.

<div style="display: flex; gap: 10px;">
<a href="https://www.npmjs.com/package/@golevelup/ts-jest"><img src="https://img.shields.io/npm/v/@golevelup/ts-jest.svg?style=flat" alt="version" /></a>
<a href="https://www.npmjs.com/package/@golevelup/ts-jest"><img alt="downloads" src="https://img.shields.io/npm/dt/@golevelup/ts-jest.svg?style=flat"></a>
<img alt="license" src="https://img.shields.io/npm/l/@golevelup/ts-jest.svg">
</div>

## Getting Started

::: code-group

```bash [npm]
npm install @golevelup/ts-jest -D
```

```bash [yarn]
yarn add @golevelup/ts-jest -D
```

```bash [pnpm]
pnpm add @golevelup/ts-jest -D
```

:::

## Motivation

You ever just come across a type that you want to mock, but mocking the entire object seems daunting, and who knows how many sub properties the object has and if those sub properties have sub properties. The list goes on with possible problems. Enter `@golevelup/ts-jest`'s `createMock` utility function. This function will create a mock object for you with all sub properties mocked as `jest.fn()` unless otherwise provided, to allow for easy mocking later on, but more on that later.

### Side Note

This package and utility function was derived out of a want to help those unit testing things like [Guards](https://docs.nestjs.com/guards), [Interceptors](https://docs.nestjs.com/interceptors), and [Filters](https://docs.nestjs.com/exception-filters), in NestJS; however, given the dynamic nature of the package, the `createMock` utility function can handle so much more than just what's inside of NestJS. Essentially, if it has an interface, `@golevelup/ts-jest` can mock it!

## Usage

For examples we'll show how well it works with NestJS' [ExecutionContext](https://github.com/nestjs/nest/blob/master/packages/common/interfaces/features/execution-context.interface.ts) which extends NestJS' [ArgumentHost](https://github.com/nestjs/nest/blob/master/packages/common/interfaces/features/arguments-host.interface.ts#L60).

### Creating Mocks

Here is where the fun begins. As a heads up, this function **does** require you to be using Typescript, as it takes advantage of some advanced Typescript features under the hood, like `Proxies`.

1. Import the `createMock` function into your test class
2. Create a variable and set it equal to the `createMock` function **plus** its generic type input
3. Use the mock, Luke.

Example:

```ts
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';

describe('Mocked Execution Context', () => {
  it('should have a fully mocked Execution Context', () => {
    const mockExecutionContext = createMock<ExecutionContext>();
    expect(mockExecutionContext.switchToHttp()).toBeDefined();
  });
});
```

And just like that, the simplest mock can quickly and easily be made! "Big deal" you may say? It's easy to create a mock with a single property like that? Well, just watch this:

```ts
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';

describe('Mocked Execution Context', () => {
  it('should have a fully mocked Execution Context', () => {
    const mockExecutionContext = createMock<ExecutionContext>();
    expect(mockExecutionContext.switchToHttp().getRequest()).toBeDefined();
    expect(mockExecutionContext.switchToRPC().getContext()).toBeDefined();
    expect(mockExecutionContext.switchToWs().getClient()).toBeDefined();
  });
});
```

How's that for ya? No, still not impressed? All right, time to bring out the big guns.

```ts
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';

describe('Mocked Execution Context', () => {
  it('should have a fully mocked Execution Context', () => {
    const mockExecutionContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'auth',
          },
        }),
      }),
    });
    mockExecutionContext
      .switchToHttp()
      .getResponse.mockReturnValue({ data: 'res return data' });
    expect(mockExecutionContext.switchToHttp().getRequest()).toEqual({
      headers: {
        authorization: 'auth',
      },
    });
    expect(mockExecutionContext.switchToHttp().getResponse()).toEqual({
      data: 'res return data',
    });
    expect(mockExecutionContext.switchToHttp).toBeCalledTimes(3);
    expect(mockExecutionContext.switchToRPC().getContext()).toBeDefined();
    expect(mockExecutionContext.switchToWs().getClient()).toBeDefined();
  });
});
```

::: warning Note
Be aware that when providing your own mocks, if you asserting how many times you called a parent mock function, the number will be equal to the number of times the function was called in your `expects` _plus_ the number of times the function had to be called to set your mocks. In the above case, we had to call `switchToHttp()` once to set the mock for `getResponse()` and twice for the `expect` calls, so it was called in a total of three times.
:::

The above case shows how well the `createMock` utility can take in user provided values as well as returning **type safe** mocks that can easily be chained and modified as needed.

For a few more examples on what can be done [the mock.spec](src/mocks.spec.ts) file has some really cool examples that show pretty well just what is doable with this utility.

### Strict Mode

The `createMock` function supports a strict mode option that can be enabled by passing `{ strict: true }` in the options parameter. When strict mode is enabled, any attempt to call a method that hasn't been explicitly stubbed will throw an error. This is useful for ensuring that all method calls in your tests are intentional and properly mocked.

Example:

```ts
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';

describe('Strict Mode', () => {
  it('should throw error when calling unstubbed method in strict mode', () => {
    const mock = createMock<ExecutionContext>({}, { strict: true });

    // This will throw an error because switchToHttp hasn't been stubbed
    expect(() => mock.switchToHttp()).toThrow('Method mock.switchToHttp was called without being explicitly stubbed');

    // After stubbing the method, it works as expected
    mock.switchToHttp.mockReturnValue({
      getRequest: () => ({ headers: { authorization: 'auth' } })
    });
    expect(mock.switchToHttp().getRequest()).toEqual({
      headers: { authorization: 'auth' }
    });
  });
});
```
