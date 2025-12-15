import { Injectable } from '@nestjs/common';

import { topics } from '../google-cloud-pubsub.config';
import { GoogleCloudPubsubModuleOptions } from '@golevelup/nestjs-google-cloud-pubsub';

@Injectable()
export class GoogleCloudPubsubConfigService {
  public async create(): Promise<GoogleCloudPubsubModuleOptions> {
    return {
      client: {},
      topics,
    };
  }
}
