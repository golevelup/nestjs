import { HasuraAction } from './hasura.actions.interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ActionHandlerService {
  public handleAction(
    action: HasuraAction,
    headers: Record<string, string>
  ): any {
    // The implementation for this method is overriden by the containing module
  }
}
