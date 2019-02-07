import { Injectable, Module, ReflectMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DiscoveryModule, DiscoveryService, withMetaKey } from '.';

const TestConfigSymbol = Symbol('TestConfigSymbol');

const TestDecorator = (config: any) =>
  ReflectMetadata(TestConfigSymbol, config);

@Injectable()
@TestDecorator('42')
class ExampleService {
  doSomething() {
    console.log('doing something');
  }
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
    const testProviders = discoveryService.discoverClasses(x =>
      withMetaKey(TestConfigSymbol, x)
    );

    expect(testProviders).toHaveLength(1);
    console.log(testProviders[0].instance);
  });
});
