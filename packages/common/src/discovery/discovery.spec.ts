import {
  Controller,
  Get,
  Injectable,
  Module,
  ReflectMetadata
} from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { DiscoveryModule, DiscoveryService, providerWithMetaKey } from '.';

// Set up a Controller and Provider that can be used by the Testing Module

const ExampleClassSymbol = Symbol('ExampleClassSymbol');

const ExampleMethodSymbol = Symbol('ExampleMethodSymbol');

const ExampleClassDecorator = (config: any) =>
  ReflectMetadata(ExampleClassSymbol, config);

const ExampleMethodDecorator = (config: any) => (target, key, descriptor) =>
  ReflectMetadata(ExampleMethodSymbol, config)(target, key, descriptor);

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
    it('should discover providers based on a metadata key', () => {
      const providers = discoveryService.discoverProviders(
        providerWithMetaKey(ExampleClassSymbol)
      );

      expect(providers).toHaveLength(1);
      const [provider] = providers;
      expect(provider.metatype).toBe(ExampleService);
      expect(provider.instance).toBeInstanceOf(ExampleService);
    });

    it('should discover provider method handler meta based on a metadata key', () => {
      const handlerMeta = discoveryService.discoverProviderMethodsWithMeta(
        ExampleMethodSymbol
      );

      expect(handlerMeta.length).toBe(1);

      const meta = handlerMeta[0];

      expect(meta).toMatchObject({
        meta: 'example provider method meta',
        methodName: 'specialMethod'
      });

      expect(meta.component.instance).toBeInstanceOf(ExampleService);
    });
  });

  describe('Controllers', () => {
    it('should discover controllers', () => {
      const controllers = discoveryService.discoverControllers(
        controller => true
      );
      expect(controllers).toHaveLength(1);
      const [controller] = controllers;
      expect(controller.metatype).toBe(ExampleController);
      expect(controller.instance).toBeInstanceOf(ExampleController);
    });

    it('should discover controller method handler meta based on a metadata key', () => {
      const handlerMeta = discoveryService.discoverControllerMethodsWithMeta<
        string
      >(PATH_METADATA);
      const [first] = handlerMeta;

      // console.log(first.meta);
      // console.log(Reflect.getMetadataKeys(first.handler));
      // console.log(Reflect.getMetadata('path', first.handler));
      // console.log(Reflect.getMetadata('method', first.handler));
    });
  });
});
