import { Injectable, Module, ReflectMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DiscoveryModule, DiscoveryService, providerWithMetaKey } from '.';

const ExampleClassSymbol = Symbol('ExampleClassSymbol');

const ExampleMethodSymbol = Symbol('ExampleMethodSymbol');

const ExampleClassDecorator = (config: any) =>
  ReflectMetadata(ExampleClassSymbol, config);

const ExampleMethodDecorator = (config: any) => (target, key, descriptor) =>
  ReflectMetadata(ExampleMethodSymbol, config)(target, key, descriptor);

@Injectable()
@ExampleClassDecorator('class')
class ExampleService {
  @ExampleMethodDecorator('example method meta')
  specialMethod() {}

  anotherMethod() {}
}

@Module({
  providers: [ExampleService]
})
class ExampleModule {}

describe('Discovery', () => {
  let app: TestingModule;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [DiscoveryModule, ExampleModule]
    }).compile();

    await app.init();
  });

  it('should discover providers based on a metadata key', () => {
    const discoveryService = app.get<DiscoveryService>(DiscoveryService);

    const providers = discoveryService.discoverProviders(
      providerWithMetaKey(ExampleClassSymbol)
    );

    expect(providers).toHaveLength(1);
    const [provider] = providers;
    expect(provider.metatype).toBe(ExampleService);
    expect(provider.instance).toBeInstanceOf(ExampleService);
  });

  it('should discover method handler meta based on a metadata key', () => {
    const discoveryService = app.get<DiscoveryService>(DiscoveryService);

    const handlerMeta = discoveryService.discoverHandlersWithMeta(
      ExampleMethodSymbol
    );

    expect(handlerMeta.length).toBe(1);

    const meta = handlerMeta[0];

    expect(meta).toMatchObject({
      meta: 'example method meta',
      methodName: 'specialMethod'
    });

    expect(meta.provider.instance).toBeInstanceOf(ExampleService);
  });
});
