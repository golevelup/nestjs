import { Module } from '@nestjs/common';
import {
  WebhooksConfigurableModuleClass,
  WebhooksOptionsToken,
} from './webhooks-module-definition';
import { WEBHOOK_MODULE_CONFIG_TOKEN } from './webhooks.constants';
import {
  WebhooksModuleConfig,
  WebhooksModuleProvidedConfig,
} from './webhooks.interfaces';

const defaultModuleOptions: WebhooksModuleConfig = {
  requestRawBodyProperty: 'rawBody',
};

/**
 * Module that allows for configuration of the ConfigurableRawBodyMiddleware. Use the
 * module to specify which property on the request object that the raw body will be available on.
 * If not set, the property will default to "rawBody"
 */
@Module({
  providers: [
    {
      provide: WEBHOOK_MODULE_CONFIG_TOKEN,
      inject: [WebhooksOptionsToken],
      useFactory: (
        providedConfig: WebhooksModuleProvidedConfig,
      ): WebhooksModuleConfig => ({
        ...defaultModuleOptions,
        ...providedConfig,
      }),
    },
  ],
  exports: [WEBHOOK_MODULE_CONFIG_TOKEN],
})
export class WebhooksModule extends WebhooksConfigurableModuleClass {}
