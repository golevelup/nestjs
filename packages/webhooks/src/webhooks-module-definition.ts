import { ConfigurableModuleBuilder } from '@nestjs/common';
import { WebhooksModuleProvidedConfig } from './webhooks.interfaces';

export const {
  ConfigurableModuleClass: WebhooksConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: WebhooksOptionsToken,
} = new ConfigurableModuleBuilder<WebhooksModuleProvidedConfig>()
  .setClassMethodName('forRoot')
  .build();
