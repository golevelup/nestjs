import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { InjectHasuraConfig } from './hasura.decorators';
import { HasuraModuleConfig } from './hasura.interfaces';

@Injectable()
export class HasuraEventHandlerHeaderGuard implements CanActivate {
  private readonly apiSecret: Buffer | undefined;
  constructor(
    @InjectHasuraConfig()
    private readonly hasuraConfig: HasuraModuleConfig,
  ) {
    const secret =
      typeof hasuraConfig.webhookConfig.secretFactory === 'function'
        ? hasuraConfig.webhookConfig.secretFactory()
        : hasuraConfig.webhookConfig.secretFactory;
    // A factory reading an unset env var returns undefined. Without this, a
    // request with no header compared undefined === undefined and passed.
    this.apiSecret = secret ? Buffer.from(secret) : undefined;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const secretRequestHeader =
      request.headers[this.hasuraConfig.webhookConfig.secretHeader];

    if (!this.apiSecret || typeof secretRequestHeader !== 'string') {
      return false;
    }

    const received = Buffer.from(secretRequestHeader);
    return (
      received.length === this.apiSecret.length &&
      timingSafeEqual(received, this.apiSecret)
    );
  }
}
