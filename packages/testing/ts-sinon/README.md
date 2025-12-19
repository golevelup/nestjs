# Sinon Mocking (ts-sinon)

Utilities for making testing [NestJS](https://docs.nestjs.com) applications easier.

<div style="display: flex; gap: 10px;">
<a href="https://www.npmjs.com/package/@golevelup/ts-sinon"><img src="https://img.shields.io/npm/v/@golevelup/ts-sinon.svg?style=flat" alt="version" /></a>
<a href="https://www.npmjs.com/package/@golevelup/ts-sinon"><img alt="downloads" src="https://img.shields.io/npm/dt/@golevelup/ts-sinon.svg?style=flat"></a>
<img alt="license" src="https://img.shields.io/npm/l/@golevelup/ts-sinon.svg">
</div>

## Getting Started

::: code-group

```bash [npm]
npm install @golevelup/ts-sinon -D
```

```bash [yarn]
yarn add @golevelup/ts-sinon -D
```

```bash [pnpm]
pnpm add @golevelup/ts-sinon -D
```

:::

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
    }),
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

::: warning Note
When providing your own mocks, the number of times a parent mock function was called includes the times needed to set your mocks.
:::
