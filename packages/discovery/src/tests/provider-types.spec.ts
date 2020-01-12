import { Injectable, Module, SetMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DiscoveryModule, DiscoveryService, withMetaAtKey } from '..';
import { ModuleMetadata } from '@nestjs/common/interfaces';

const TestDecorator = (config: any) => SetMetadata('test', config);

@Injectable()
@TestDecorator('dynamicProvider')
class DynamicProvider {
  @TestDecorator('dynamicMethod')
  doSomething() {
    return 42;
  }
}

async function providerMetadataTest(discover: DiscoveryService) {
  const providers = await discover.providers(withMetaAtKey('test'));

  expect(providers).toHaveLength(1);
  const [provider] = providers;
  expect(provider.instance).toBeInstanceOf(DynamicProvider);
}

@Module({
  providers: [
    {
      provide: DynamicProvider,
      useFactory: async (): Promise<DynamicProvider> => {
        const dynamic = new DynamicProvider();
        return new Promise(resolve => {
          setTimeout(() => resolve(dynamic), 50);
        });
      }
    }
  ]
})
class ExampleModule {}

interface CaseType {
  name: string;
  moduleMetadata: ModuleMetadata;
  matchObject: {
    meta: string;
    discoveredMethod: { methodName: string; parentClass?: { name: string } };
  };
}

const testCases: CaseType[] = [
  {
    name: 'Value Providers',
    moduleMetadata: {
      imports: [DiscoveryModule],
      providers: [
        {
          provide: 'ValueProviderKey',
          useValue: new DynamicProvider()
        }
      ]
    },
    matchObject: {
      meta: 'dynamicMethod',
      discoveredMethod: {
        methodName: 'doSomething',
        parentClass: {
          name: 'ValueProviderKey'
        }
      }
    }
  },
  {
    name: 'FactoryProvider',
    moduleMetadata: {
      imports: [DiscoveryModule],
      providers: [
        {
          provide: 'FactoryProviderKey',
          useFactory: () => new DynamicProvider()
        }
      ]
    },
    matchObject: {
      meta: 'dynamicMethod',
      discoveredMethod: {
        methodName: 'doSomething',
        parentClass: {
          name: 'FactoryProviderKey'
        }
      }
    }
  },
  {
    name: 'Async Factory Provider',
    moduleMetadata: {
      imports: [DiscoveryModule, ExampleModule]
    },
    matchObject: {
      meta: 'dynamicMethod',
      discoveredMethod: {
        methodName: 'doSomething'
      }
    }
  }
];

describe.each(testCases)('Provider Types', (testCase: CaseType) => {
  describe(`${testCase.name}`, () => {
    let app: TestingModule;
    let discover: DiscoveryService;

    beforeEach(async () => {
      app = await Test.createTestingModule(testCase.moduleMetadata).compile();

      await app.init();

      discover = app.get<DiscoveryService>(DiscoveryService);
    });

    it('should discover providers based on a metadata key', async () => {
      providerMetadataTest(discover);
    });

    it('should discover providers based on a metadata key', async () => {
      const providerMethodMeta = await discover.providerMethodsWithMetaAtKey(
        'test'
      );

      expect(providerMethodMeta.length).toBe(1);

      const meta = providerMethodMeta[0];

      expect(meta).toMatchObject(testCase.matchObject);

      expect(meta.discoveredMethod.parentClass.instance).toBeInstanceOf(
        DynamicProvider
      );
    });
  });
});
