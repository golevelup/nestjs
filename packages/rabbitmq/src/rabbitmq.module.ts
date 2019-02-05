import { DynamicModule, Module } from '@nestjs/common';

@Module({})
export class RabbitMQModule {
  public static forRoot(): DynamicModule {
    return {
      module: RabbitMQModule
    };
  }
}
