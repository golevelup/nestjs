export async function assertRejectsWith<T extends Error>(
  asyncFn: (...parameters: any[]) => Promise<any>,
  ExpectedErrorClass: new (...args: any[]) => T,
  assertError?: (error: T) => void,
) {
  try {
    await asyncFn();

    return fail(
      `Expected ${ExpectedErrorClass.name} to be thrown, but it did not throw.`,
    );
  } catch (error: any) {
    expect(error).toBeInstanceOf(ExpectedErrorClass);

    if (error instanceof ExpectedErrorClass && assertError) {
      assertError(error);
    }
  }
}
