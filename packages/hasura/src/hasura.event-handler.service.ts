import { Injectable } from '@nestjs/common';
import { HasuraEventHandler } from './hasura.decorators';
import { HasuraEvent } from './hasura.interfaces';

@Injectable()
export class EventHandlerService {
  public handleEvent(evt: HasuraEvent) {
    // The implementation for this method is overriden by the containing module
    console.log(evt);
  }

  @HasuraEventHandler({
    table: { name: 'user' },
  })
  public fakeHandler() {
    console.log('fake handler yo');
    return 42;
  }
}
