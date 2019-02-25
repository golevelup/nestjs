import { DiscoveryModule, DiscoveryService } from '@nestjs-plus/common';
import { Logger, Module, OnModuleInit } from '@nestjs/common';

@Module({
  imports: [DiscoveryModule]
})
export class GraphqlModule implements OnModuleInit {
  private readonly logger = new Logger(GraphqlModule.name);

  constructor(private readonly discover: DiscoveryService) {}

  onModuleInit() {
    this.logger.log('Initializing graphql module');
  }
}
