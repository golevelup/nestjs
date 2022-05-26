import { HttpService } from '@nestjs/axios';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import {
  ScheduledEventRequest,
  HASURA_SERVICE_CONFIG,
  ScheduledEventMode,
} from './hasura.constants';
import {
  HasuraServiceConfig,
  HasuraScheduledEvent,
  CreateHasuraScheduledEventBody,
  DeleteHasuraScheduledEventBody,
} from './hasura.interfaces';

@Injectable()
export class HasuraService {
  constructor(
    private httpService: HttpService,
    @Inject(HASURA_SERVICE_CONFIG)
    private hasuraServiceConfig: HasuraServiceConfig
  ) {}

  async createScheduledEvent({
    name,
    comment,
    scheduled_time,
    payload,
    webhook_url,
  }: HasuraScheduledEvent): Promise<{ message: string; event_id: string }> {
    const body = this.generateCreateEventBody({
      name,
      payload,
      comment,
      scheduled_time,
      webhook_url,
    });
    try {
      const source$ = this.hasuraScheduledEventRequest(body);
      return lastValueFrom(source$).then((r) => r.data);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteScheduledEvent(
    eventId: string,
    type: ScheduledEventMode
  ): Promise<{ message: string }> {
    const body = {
      type: ScheduledEventRequest.DELETE_SCHEDULED_EVENT,
      args: {
        type,
        event_id: eventId,
      },
    };
    try {
      const source$ = this.hasuraScheduledEventRequest(body);
      return lastValueFrom(source$).then((r) => r.data);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  private hasuraScheduledEventRequest(
    body: CreateHasuraScheduledEventBody | DeleteHasuraScheduledEventBody
  ) {
    return this.httpService.post(
      `${this.hasuraServiceConfig.endpoint}/v1/metadata`,
      body,
      {
        headers: {
          'X-Hasura-Admin-Secret': this.hasuraServiceConfig.adminSecret,
        },
      }
    );
  }

  private generateCreateEventBody({
    name,
    payload,
    comment,
    scheduled_time,
    webhook_url,
  }: HasuraScheduledEvent) {
    return {
      type: ScheduledEventRequest.CREATE_SCHEDULED_EVENT,
      args: {
        webhook: webhook_url
          ? webhook_url
          : `{{${this.hasuraServiceConfig.nestEndpointEnvName}}}`,
        schedule_at: scheduled_time,
        payload,
        headers: [
          {
            name: this.hasuraServiceConfig.secretHeader,
            value_from_env: this.hasuraServiceConfig.secretHeaderEnvName,
          },
          {
            name: this.hasuraServiceConfig.scheduledEventsHeader,
            value: name,
          },
        ],
        comment: comment,
      },
    };
  }
}
