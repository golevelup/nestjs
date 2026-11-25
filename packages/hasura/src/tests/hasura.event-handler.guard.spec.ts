import { ExecutionContext } from '@nestjs/common';
import { HasuraEventHandlerHeaderGuard } from '../hasura.event-handler.guard';
import { HasuraModuleConfig } from '../hasura.interfaces';

const secretHeader = 'api-secret-header';

const guardFor = (
  secretFactory: HasuraModuleConfig['webhookConfig']['secretFactory'],
) =>
  new HasuraEventHandlerHeaderGuard({
    webhookConfig: { secretHeader, secretFactory },
  } as HasuraModuleConfig);

const contextWith = (headers: Record<string, unknown>) =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ headers }) }),
  }) as unknown as ExecutionContext;

describe('HasuraEventHandlerHeaderGuard', () => {
  it('accepts the configured secret', () => {
    expect(
      guardFor('secret').canActivate(contextWith({ [secretHeader]: 'secret' })),
    ).toBe(true);
    expect(
      guardFor(() => 'secret').canActivate(
        contextWith({ [secretHeader]: 'secret' }),
      ),
    ).toBe(true);
  });

  it('rejects a wrong secret, including one of a different length', () => {
    expect(
      guardFor('secret').canActivate(contextWith({ [secretHeader]: 'secreT' })),
    ).toBe(false);
    expect(
      guardFor('secret').canActivate(
        contextWith({ [secretHeader]: 'secret2' }),
      ),
    ).toBe(false);
  });

  it('rejects a header sent more than once', () => {
    expect(
      guardFor('secret').canActivate(
        contextWith({ [secretHeader]: ['secret', 'secret'] }),
      ),
    ).toBe(false);
  });

  it('rejects every request when the secret factory returns nothing', () => {
    const unset = () => undefined as unknown as string;
    expect(guardFor(unset).canActivate(contextWith({}))).toBe(false);
    expect(guardFor('').canActivate(contextWith({ [secretHeader]: '' }))).toBe(
      false,
    );
  });
});
