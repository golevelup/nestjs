import { Injectable, Module, ReflectMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DiscoveryModule, DiscoveryService, withMetaKey } from '.';

const ExampleClassSymbol = Symbol('ExampleClassSymbol');

const ExampleMethodSymbol = Symbol('ExampleMethodSymbol');

const ExampleClassDecorator = (config: any) =>
  ReflectMetadata(ExampleClassSymbol, config);

const ExampleMethodDecorator = (config: any) => (target, key, descriptor) =>
  ReflectMetadata(ExampleMethodSymbol, config)(target, key, descriptor);

@Injectable()
@ExampleClassDecorator('class')
class ExampleService {
  @ExampleMethodDecorator('method')
  method() {}

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

  it('should discover providers based on metadata', () => {
    const discoveryService = app.get<DiscoveryService>(DiscoveryService);
    const testProviders = discoveryService.discoverProviders(x =>
      withMetaKey(ExampleClassSymbol, x)
    );

    expect(testProviders).toHaveLength(1);
    console.log(testProviders[0].instance);
  });

  it('should discover method handlers based on a predicate', () => {
    const discoveryService = app.get<DiscoveryService>(DiscoveryService);

    const handlers = discoveryService.discoverHandlers(x =>
      withMetaKey(ExampleClassSymbol, x)
    );
  });
});
