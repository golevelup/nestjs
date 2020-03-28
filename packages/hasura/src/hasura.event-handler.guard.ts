import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { InjectHasuraConfig } from './hasura.decorators';
import { HasuraModuleConfig } from './hasura.interfaces';

@Injectable()
export class HasuraEventHandlerHeaderGuard implements CanActivate {
  private readonly apiSecret: string;
  constructor(
    @InjectHasuraConfig()
    private readonly hasuraConfig: HasuraModuleConfig
  ) {
    this.apiSecret =
      typeof hasuraConfig.secretFactory === 'function'
        ? hasuraConfig.secretFactory()
        : hasuraConfig.secretFactory;
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const secretRequestHeader = request.headers[this.hasuraConfig.secretHeader];

    return secretRequestHeader === this.apiSecret;
  }
}
