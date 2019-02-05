import { Global, Module, OnModuleInit } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { CustomSymbol } from './../custom.decorator';
import { DiscoveryService, withMetaKey } from './discovery.service';

@Global()
@Module({
  providers: [DiscoveryService, MetadataScanner],
})
export class DiscoveryModule implements OnModuleInit {
  constructor(private readonly discoveryService: DiscoveryService) {}

  onModuleInit() {
    const something = this.discoveryService.discoverClasses(x =>
      withMetaKey(CustomSymbol, x),
    );

    console.log(something);

    // const first = something[0];
    // console.log(first);

    // console.log(first.metatype === AppModule);

    // const testModule = new AppModule();
    // console.log(testModule);
    // console.log(first.instance instanceof AppModule);
  }
}
