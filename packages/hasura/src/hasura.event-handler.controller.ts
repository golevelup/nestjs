import { Body, Controller, Post } from '@nestjs/common';
import { EventHandlerService } from './hasura.event-handler.service';
import { HasuraEvent } from './hasura.interfaces';

@Controller('/hasura')
export class EventHandlerController {
  constructor(private readonly eventHandlerService: EventHandlerService) {}

  @Post()
  handleEvent(@Body() evt: HasuraEvent) {
    return this.eventHandlerService.handleEvent(evt);
  }
}
