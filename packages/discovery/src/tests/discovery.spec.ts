import {
  Controller,
  Get,
  Injectable,
  Module,
  ReflectMetadata
} from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { DiscoveryModule, DiscoveryService, withMetaAtKey } from '..';

// Set up a Controller and Provider that can be used by the Testing Module

const ExampleClassSymbol = Symbol('ExampleClassSymbol');

const ExampleMethodSymbol = Symbol('ExampleMethodSymbol');

const ExampleClassDecorator = (config: any) =>
  ReflectMetadata(ExampleClassSymbol, config);

const ExampleMethodDecorator = (config: any) =>
  ReflectMetadata(ExampleMethodSymbol, config);

@Injectable()
@ExampleClassDecorator('class')
class ExampleService {
  @ExampleMethodDecorator('example provider method meta')
  specialMethod() {}

  anotherMethod() {}
}

@Controller('example')
class ExampleController {
  @Get('route')
  @ExampleMethodDecorator('example controller method meta')
  public get() {
    return 42;
  }
}

@Module({
  providers: [ExampleService],
  controllers: [ExampleController]
})
class ExampleModule {}

describe('Discovery', () => {
  let app: TestingModule;
  let discoveryService: DiscoveryService;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [DiscoveryModule, ExampleModule]
    }).compile();

    await app.init();

    discoveryService = app.get<DiscoveryService>(DiscoveryService);
  });

  describe('Providers', () => {
    it('should discover providers based on a metadata key', async () => {
      const providers = await discoveryService.providers(
        withMetaAtKey(ExampleClassSymbol)
      );

      expect(providers).toHaveLength(1);
      const [provider] = providers;
      expect(provider.classType).toBe(ExampleService);
      expect(provider.instance).toBeInstanceOf(ExampleService);
    });

    it('should discover provider method handler meta based on a metadata key', async () => {
      const providerMethodMeta = await discoveryService.providerMethodsWithMetaAtKey(
        ExampleMethodSymbol
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

  describe('Controllers', () => {
    it('should discover controllers', async () => {
      const controllers = await discoveryService.controllers(
        controller => true
      );

      expect(controllers).toHaveLength(1);
      const [controller] = controllers;
      expect(controller.classType).toBe(ExampleController);
      expect(controller.instance).toBeInstanceOf(ExampleController);
    });

    it('should discover controller method handler meta based on a metadata key', async () => {
      const controllerMethodMeta = await discoveryService.controllerMethodsWithMetaAtKey<
        string
      >(PATH_METADATA);
      const [first] = controllerMethodMeta;

      expect(controllerMethodMeta.length).toBe(1);

      const meta = controllerMethodMeta[0];

      expect(meta).toMatchObject({
        meta: 'route',
        discoveredMethod: {
          methodName: 'get',
          parentClass: {
            classType: ExampleController
          }
        }
      });

      expect(meta.discoveredMethod.parentClass.instance).toBeInstanceOf(
        ExampleController
      );
    });
  });
});
