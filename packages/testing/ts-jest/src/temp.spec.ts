import { createMock } from './mocks';

interface TestInterface {
  func: () => Promise<Counter>;
}

type Counter = {
  count: number;
};

describe('regression', () => {
  it('showcases the regression', async () => {
    expect.hasAssertions();
    const testmock = createMock<TestInterface>();

    const c = await testmock.func();
    try {
      c.count < 0;
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toBe('Cannot convert object to primitive value');
    }
  });
});
