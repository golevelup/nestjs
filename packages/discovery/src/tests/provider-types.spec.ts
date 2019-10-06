import { Injectable, Module, SetMetadata, Scope } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DiscoveryModule, DiscoveryService, withMetaAtKey } from '..';

const TestDecorator = (config: any) => SetMetadata('test', config);

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
          setTimeout(() => resolve(dynamic), 50);
        });
      }
    }
  ]
})
class ExampleModule {}

describe('Provider Types', () => {
  describe('Value Providers', () => {
    let app: TestingModule;
    let discover: DiscoveryService;

    beforeEach(async () => {
      app = await Test.createTestingModule({
        imports: [DiscoveryModule],
        providers: [
          {
            provide: 'ValueProviderKey',
            useValue: new DynamicProvider()
          }
        ]
      }).compile();

      await app.init();

      discover = app.get<DiscoveryService>(DiscoveryService);
    });

    it('should discover providers based on a metadata key', async () => {
      const providers = await discover.providers(withMetaAtKey('test'));

      expect(providers).toHaveLength(1);
      const [provider] = providers;
      expect(provider.instance).toBeInstanceOf(DynamicProvider);
    });

    it('should discover provider method handler meta based on a metadata key', async () => {
      const providerMethodMeta = await discover.providerMethodsWithMetaAtKey(
        'test'
      );

      expect(providerMethodMeta.length).toBe(1);

      const meta = providerMethodMeta[0];

      expect(meta).toMatchObject({
        meta: 'dynamicMethod',
        discoveredMethod: {
          methodName: 'doSomething',
          parentClass: {
            name: 'ValueProviderKey'
          }
        }
      });

      expect(meta.discoveredMethod.parentClass.instance).toBeInstanceOf(
        DynamicProvider
      );
    });
  });

  describe('Factory Providers', () => {
    let app: TestingModule;
    let discover: DiscoveryService;

    beforeEach(async () => {
      app = await Test.createTestingModule({
        imports: [DiscoveryModule],
        providers: [
          {
            provide: 'FactoryProviderKey',
            useFactory: () => new DynamicProvider()
          }
        ]
      }).compile();

      await app.init();

      discover = app.get<DiscoveryService>(DiscoveryService);
    });

    it('should discover providers based on a metadata key', async () => {
      const providers = await discover.providers(withMetaAtKey('test'));

      expect(providers).toHaveLength(1);
      const [provider] = providers;
      expect(provider.instance).toBeInstanceOf(DynamicProvider);
    });

    it('should discover provider method handler meta based on a metadata key', async () => {
      const providerMethodMeta = await discover.providerMethodsWithMetaAtKey(
        'test'
      );

      expect(providerMethodMeta.length).toBe(1);

      const meta = providerMethodMeta[0];

      expect(meta).toMatchObject({
        meta: 'dynamicMethod',
        discoveredMethod: {
          methodName: 'doSomething',
          parentClass: {
            name: 'FactoryProviderKey'
          }
        }
      });

      expect(meta.discoveredMethod.parentClass.instance).toBeInstanceOf(
        DynamicProvider
      );
    });
  });

  describe('Async Factory Providers', () => {
    let app: TestingModule;
    let discover: DiscoveryService;

    beforeEach(async () => {
      app = await Test.createTestingModule({
        imports: [DiscoveryModule, ExampleModule]
      }).compile();

      await app.init();

      discover = app.get<DiscoveryService>(DiscoveryService);
    });

    it('should discover providers based on a metadata key', async () => {
      const providers = await discover.providers(withMetaAtKey('test'));

      expect(providers).toHaveLength(1);
      const [provider] = providers;
      expect(provider.instance).toBeInstanceOf(DynamicProvider);
    });

    it('should discover provider method handler meta based on a metadata key', async () => {
      const providerMethodMeta = await discover.providerMethodsWithMetaAtKey(
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
