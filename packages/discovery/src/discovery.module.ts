import { Global, Module } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { DiscoveryService } from './discovery.service';

/**
 * Exposes a query API over top of the NestJS Module container
 *
 * @export
 * @class DiscoveryModule
 */
@Global()
@Module({
  providers: [DiscoveryService, MetadataScanner],
  exports: [DiscoveryService],
})
export class DiscoveryModule {}
