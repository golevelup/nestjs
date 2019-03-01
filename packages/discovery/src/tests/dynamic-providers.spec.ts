import { Injectable, Module, ReflectMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DiscoveryModule, DiscoveryService, withMetaAtKey } from '..';

const TestDecorator = (config: any) => ReflectMetadata('test', config);

class DynamicProvider {
  @TestDecorator('dynamicMethod')
  doSomething() {
    return 42;
  }
}

@Injectable()
@TestDecorator('class')
class ExampleService {
  specialMethod() {}
}

@Module({
  providers: [
    ExampleService,
    {
      provide: DynamicProvider,
      useFactory: async (): Promise<DynamicProvider> => {
        const dynamic = new DynamicProvider();
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(dynamic), 500);
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

  describe('Discovering Providers', () => {
    it('should discover providers based on a metadata key', async () => {
      const providers = await discoveryService.providers(withMetaAtKey('test'));

      expect(providers).toHaveLength(1);
      const [provider] = providers;
      expect(provider.classType).toBe(ExampleService);
      expect(provider.instance).toBeInstanceOf(ExampleService);
    });

    it('should discover provider method handler meta based on a metadata key', async () => {
      const providerMethodMeta = await discoveryService.providerMethodsWithMetaAtKey(
        'test'
      );

      expect(providerMethodMeta.length).toBe(1);

      const meta = providerMethodMeta[0];

      expect(meta).toMatchObject({
        meta: 'example provider method meta',
        discoveredMethod: {
          methodName: 'specialMethod',
          parentClass: {
            classType: ExampleService
          }
        }
      });

      expect(meta.discoveredMethod.parentClass.instance).toBeInstanceOf(
        ExampleService
      );
    });
  });
});
