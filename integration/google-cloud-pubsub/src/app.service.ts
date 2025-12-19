import { Injectable } from '@nestjs/common';

import { GoogleCloudPubsubMessage } from '@golevelup/nestjs-google-cloud-pubsub';
import { GoogleCloudPubsubPayloadsMap, GoogleCloudPubsubPublisher, GoogleCloudPubsubSubscribe } from './google-cloud-pubsub.config';

@Injectable()
export class AppService {
  constructor(private readonly googleCloudPubsubPublisher: GoogleCloudPubsubPublisher) {}

  async onApplicationBootstrap() {
    this.publish();
  }

  public async publish() {
    const messageId = await this.googleCloudPubsubPublisher.publish('order.created', {
      data: {
        field1: 'field1',
        field2: 1,
        field3: true,
        field4: 4,
        field5: { nestedField1: 'nestedField1' },
        field6: null,
      },
    });

    console.log({ messageId });
  }

  @GoogleCloudPubsubSubscribe('order.created', 'order.created.subscription.analytic-service')
  public async handle(payload: GoogleCloudPubsubMessage<GoogleCloudPubsubPayloadsMap['order.created']>) {
    console.dir({ LOG_FROM: payload }, { depth: 5 });
    throw new Error();
  }

  @GoogleCloudPubsubSubscribe('order.created.dead-letter-queue', 'order.created.dead-letter-queue.subscription')
  public async handleDlq(payload: GoogleCloudPubsubMessage) {
    console.dir({ LOG_FROM_DLQ: payload }, { depth: 5 });
  }
}
