import { DiscoveryModule, DiscoveryService } from '@nestjs-plus/common';
import { DynamicModule, Module, OnModuleInit } from '@nestjs/common';

@Module({
  imports: [DiscoveryModule]
})
export class RabbitMQModule implements OnModuleInit {
  constructor(private readonly discoveryService: DiscoveryService) {}

  public static forRoot(): DynamicModule {
    return {
      module: RabbitMQModule
    };
  }

  public async onModuleInit() {
    console.log('rabbit module init');

    // const rabbitMeta = this.discoveryService.discoverHandlersWithMeta()
  }
}
