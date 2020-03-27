import { Injectable } from '@nestjs/common';
import { HasuraEvent } from './hasura.interfaces';

@Injectable()
export class EventHandlerService {
  public handleEvent(evt: HasuraEvent): any {
    // The implementation for this method is overriden by the containing module
    console.log(evt);
  }
}
