import { Injectable, Module, ReflectMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DiscoveryModule, DiscoveryService, withMetaAtKey } from '..';

const TestDecorator = (config: any) => ReflectMetadata('test', config);

@Injectable()
@TestDecorator('dynamicProvider')
class DynamicProvider {
  @TestDecorator('dynamicMethod')
  doSomething() {
    return 42;
  }
}

@Module({
  providers: [
    {
      provide: DynamicProvider,
      useFactory: async (): Promise<DynamicProvider> => {
        const dynamic = new DynamicProvider();
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(dynamic), 100);
        });
      }
    }
  ]
})
class ExampleModule {}

describe('DiscoveryWithDynamicProviders', () => {
  let app: TestingModule;
  let discoveryService: DiscoveryService;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [DiscoveryModule, ExampleModule]
    }).compile();

    await app.init();

    discoveryService = app.get<DiscoveryService>(DiscoveryService);
  });

  describe('Discovering Dynamic Providers', () => {
    it('should discover providers based on a metadata key on dynamic async providers', async () => {
      const providers = await discoveryService.providers(withMetaAtKey('test'));

      expect(providers).toHaveLength(1);
      const [provider] = providers;
      expect(provider.instance).toBeInstanceOf(DynamicProvider);
    });

    it('should discover provider method handler meta based on a metadata key', async () => {
      const providerMethodMeta = await discoveryService.providerMethodsWithMetaAtKey(
        'test'
      );

      expect(providerMethodMeta.length).toBe(1);

      const meta = providerMethodMeta[0];

      expect(meta).toMatchObject({
        meta: 'dynamicMethod',
        discoveredMethod: {
          methodName: 'doSomething'
        }
      });

      expect(meta.discoveredMethod.parentClass.instance).toBeInstanceOf(
        DynamicProvider
      );
    });
  });
});
