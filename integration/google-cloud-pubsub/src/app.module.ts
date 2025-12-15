import { Module } from '@nestjs/common';
import { GoogleCloudPubsubModule } from '@golevelup/nestjs-google-cloud-pubsub';

import { GoogleCloudPubsubPublisher } from './google-cloud-pubsub.config';
import { GoogleCloudPubsubConfigService } from './config/google-cloud-pubsub.config-service';
import { AppService } from './app.service';

@Module({
  imports: [
    GoogleCloudPubsubModule.registerAsync({
      useClass: GoogleCloudPubsubConfigService,
      publisher: GoogleCloudPubsubPublisher,
    }),
  ],
  controllers: [],
  exports: [],
  providers: [AppService],
})
export class AppModule {}
