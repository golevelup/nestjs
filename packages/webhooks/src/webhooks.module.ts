import { createConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { Module } from '@nestjs/common';
import {
  WEBHOOK_MODULE_CONFIG_TOKEN,
  WEBHOOK_MODULE_PROVIDED_CONFIG_TOKEN,
} from './webhooks.contants';
import {
  WebhooksModuleConfig,
  WebhooksModuleProvidedConfig,
} from './webhooks.interfaces';

const defaultModuleOptions = {
  requestRawBodyProperty: 'rawBody',
};

/**
 * Module that allows for configuration of the ConfigurableRawBodyMiddleware. Use the
 * module to specify which property on the request object that the raw body will be available on.
 * If not set, the property will default to "rawBody"
 */
@Module({})
export class WebhooksModule extends createConfigurableDynamicRootModule<
  WebhooksModule,
  WebhooksModuleProvidedConfig
>(WEBHOOK_MODULE_PROVIDED_CONFIG_TOKEN, {
  providers: [
    {
      provide: WEBHOOK_MODULE_CONFIG_TOKEN,
      useFactory: (
        providedConfig: WebhooksModuleProvidedConfig
      ): WebhooksModuleConfig => {
        return { ...defaultModuleOptions, ...providedConfig };
      },
      inject: [WEBHOOK_MODULE_PROVIDED_CONFIG_TOKEN],
    },
  ],
  exports: [WEBHOOK_MODULE_PROVIDED_CONFIG_TOKEN, WEBHOOK_MODULE_CONFIG_TOKEN],
}) {}
