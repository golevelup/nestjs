import { GoogleCloudPubsubMessage } from '@golevelup/nestjs-google-cloud-pubsub';
import {
  GoogleCloudPubsubPayloadsMap,
  GoogleCloudPubsubPublisher,
} from './google-cloud-pubsub.config';
export declare class AppService {
  private readonly googleCloudPubsubPublisher;
  constructor(googleCloudPubsubPublisher: GoogleCloudPubsubPublisher);
  onApplicationBootstrap(): Promise<void>;
  publish(): Promise<void>;
  handle(
    payload: GoogleCloudPubsubMessage<
      GoogleCloudPubsubPayloadsMap['order.created']
    >,
  ): Promise<void>;
  handleBatch(
    payload: GoogleCloudPubsubMessage<
      GoogleCloudPubsubPayloadsMap['order.created']
    >[],
  ): Promise<void>;
  handleDlq(payload: GoogleCloudPubsubMessage): Promise<void>;
}
