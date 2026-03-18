import { Global, Module } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { MetadataScanner } from '@nestjs/core';

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
