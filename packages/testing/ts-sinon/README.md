# @golevelup/ts-sinon

<p align="center">
<a href="https://www.npmjs.com/package/@golevelup/ts-sinon"><img src="https://img.shields.io/npm/v/@golevelup/ts-sinon.svg?style=flat" alt="version" /></a>
<a href="https://www.npmjs.com/package/@golevelup/ts-sinon"><img alt="downloads" src="https://img.shields.io/npm/dt/@golevelup/ts-sinon.svg?style=flat"></a>
<img alt="license" src="https://img.shields.io/npm/l/@golevelup/ts-sinon.svg">
</p>

## Motivation

With `@golevelup/ts-sinon`'s `createMock` utility function, you can easily generate deeply nested mock objects for unit
testing, especially useful for mocking complex types like those found in NestJS.

## Usage

This package is particularly handy when unit testing components in NestJS, but it's not limited to that. It can
essentially mock any TypeScript interface!

### Installation

```sh
npm i @golevelup/ts-sinon --save-dev
```

or

```sh
yarn add @golevelup/ts-sinon --dev
```

### Creating Mocks

1. Import the `createMock` function into your test class.
2. Create a variable and set it equal to the `createMock` function with its generic type input.
3. Use the mock, Luke.

Here's an example with NestJS' `ExecutionContext`:

```ts
import { createMock } from '@golevelup/ts-sinon';
import { ExecutionContext } from '@nestjs/common';

describe('Mocked Execution Context', () => {
  it('should have a fully mocked Execution Context', () => {
    const mockExecutionContext = createMock<ExecutionContext>();
    expect(mockExecutionContext.switchToHttp()).toBeDefined();
  });
});
```

`createMock` generates all sub-properties as `sinon.stub()`, so you can chain method calls:

```ts
it('should correctly resolve mocked providers', async () => {
  const request = {
    key: 'val',
  };

  mockExecutionContext.switchToHttp.returns(
    createMock<HttpArgumentsHost>({
      getRequest: () => request,
    })
  );

  const mockResult = mockExecutionContext.switchToHttp().getRequest();
  expect(mockResult).toBe(request);
});
```

You can also easily provide your own mocks:

```ts
const mockExecutionContext = createMock<ExecutionContext>({
  switchToHttp: () => ({
    getRequest: () => ({
      headers: {
        authorization: 'auth',
      },
    }),
    getResponse: sinon.stub().returns({ data: 'res return data' }),
  }),
});
```

> **Note**: When providing your own mocks, the number of times a parent mock function was called includes the times
> needed to set your mocks.

## Contribute

Contributions welcome! Read the [contribution guidelines](../../../CONTRIBUTING.md) first.

## License

[MIT License](../../../LICENSE)
