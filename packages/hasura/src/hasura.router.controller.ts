import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { HasuraEventHandlerHeaderGuard } from './hasura.event-handler.guard';
import { EventHandlerService } from './hasura.event-handler.service';
import { HasuraEvent } from './hasura.events.interfaces';
import { ActionHandlerService } from './hasura.action-handler.service';
import { HasuraAction } from './hasura.actions.interfaces';

@Controller('/hasura')
export class HasuraRouterController {
  constructor(
    private readonly eventHandlerService: EventHandlerService,
    private readonly actionHandlerService: ActionHandlerService
  ) {}

  @UseGuards(HasuraEventHandlerHeaderGuard)
  @Post('/events')
  @HttpCode(202)
  async handleEvent(@Body() evt: HasuraEvent) {
    const response = await this.eventHandlerService.handleEvent(evt);
    return response == undefined ? { success: true } : response;
  }

  @UseGuards(HasuraEventHandlerHeaderGuard)
  @Post('/actions')
  @HttpCode(200)
  async handleAction(@Body() action: HasuraAction, @Req() request) {
    const response = await this.actionHandlerService.handleAction(
      action,
      request.headers
    );
    return response == undefined ? { success: true } : response;
  }
}
