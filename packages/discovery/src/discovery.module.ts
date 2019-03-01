import { Global, Module } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { DiscoveryService } from './discovery.service';

@Global()
@Module({
  providers: [DiscoveryService, MetadataScanner],
  exports: [DiscoveryService]
})
export class DiscoveryModule {}
