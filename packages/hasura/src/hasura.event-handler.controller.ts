import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { HasuraEventHandlerHeaderGuard } from './hasura.event-handler.guard';
import { EventHandlerService } from './hasura.event-handler.service';
import { HasuraEvent } from './hasura.interfaces';

@Controller('/hasura')
export class EventHandlerController {
  constructor(private readonly eventHandlerService: EventHandlerService) {}

  @UseGuards(HasuraEventHandlerHeaderGuard)
  @Post('/events')
  @HttpCode(202)
  async handleEvent(@Body() evt: HasuraEvent) {
    const response = await this.eventHandlerService.handleEvent(evt);
    return response == undefined ? { success: true } : response;
  }
}
