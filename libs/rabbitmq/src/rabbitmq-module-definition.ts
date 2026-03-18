import { ConfigurableModuleBuilder } from '@nestjs/common';
import { RabbitMQConfig } from './rabbitmq.interfaces';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<RabbitMQConfig>()
    .setClassMethodName('forRoot')
    .build();
