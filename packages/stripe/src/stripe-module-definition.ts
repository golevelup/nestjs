import { ConfigurableModuleBuilder } from '@nestjs/common';
import { StripeModuleConfig } from './stripe.interfaces';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<StripeModuleConfig>()
    .setClassMethodName('forRoot')
    .build();
