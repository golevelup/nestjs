import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { RABBIT_HANDLER } from '../rabbitmq.constants';
import { RabbitSubscribe } from '../rabbitmq.decorators';

const handlerSpy = jest.fn();

@Injectable()
class TestService {
  public readonly serviceValue = 'service-value';

  @RabbitSubscribe({
    exchange: 'test-exchange',
    routingKey: 'test-route',
    queue: 'test-queue',
  })
  handleMessage() {
    handlerSpy(this.serviceValue);
  }
}

describe('RabbitMQModule handler this-context binding', () => {
  beforeEach(() => {
    handlerSpy.mockClear();
  });

  it('should preserve `this` context when the handler is bound to the class instance', () => {
    const service = new TestService();
    const prototype = Object.getPrototypeOf(service);
    const originalHandler = prototype['handleMessage'];
    const boundHandler = originalHandler.bind(service);

    boundHandler({});

    expect(handlerSpy).toHaveBeenCalledWith('service-value');
  });

  it('should lose `this` context when handler is unbound', () => {
    const service = new TestService();
    const prototype = Object.getPrototypeOf(service);
    const unboundHandler = prototype['handleMessage'];

    // Without binding, `this` is undefined in strict mode, so accessing
    // this.serviceValue will throw a TypeError
    expect(() => unboundHandler.call(undefined, {})).toThrow(TypeError);
  });

  it('should preserve Reflect metadata on the bound handler so isRabbitContext() keeps working', () => {
    const service = new TestService();
    const prototype = Object.getPrototypeOf(service);
    const originalHandler = prototype['handleMessage'];
    const boundHandler = originalHandler.bind(service);

    // Copy metadata from original to bound — this is what RabbitMQModule does
    for (const metaKey of Reflect.getMetadataKeys(originalHandler)) {
      Reflect.defineMetadata(
        metaKey,
        Reflect.getMetadata(metaKey, originalHandler),
        boundHandler,
      );
    }

    // RABBIT_HANDLER metadata must be present so isRabbitContext() returns true
    expect(Reflect.getMetadataKeys(boundHandler)).toContain(RABBIT_HANDLER);
    expect(Reflect.getMetadata(RABBIT_HANDLER, boundHandler)).toMatchObject({
      type: 'subscribe',
      exchange: 'test-exchange',
      routingKey: 'test-route',
      queue: 'test-queue',
    });
  });

  it('should allow injected dependencies to be accessed when handler is bound with metadata copied', async () => {
    const module = await Test.createTestingModule({
      providers: [TestService],
    }).compile();

    const testService = module.get(TestService);
    const prototype = Object.getPrototypeOf(testService);
    const originalHandler = prototype['handleMessage'];
    const boundHandler = originalHandler.bind(testService);

    // Copy metadata (as RabbitMQModule does)
    for (const metaKey of Reflect.getMetadataKeys(originalHandler)) {
      Reflect.defineMetadata(
        metaKey,
        Reflect.getMetadata(metaKey, originalHandler),
        boundHandler,
      );
    }

    // Both this-context and metadata must be available
    boundHandler({});
    expect(handlerSpy).toHaveBeenCalledWith('service-value');
    expect(Reflect.getMetadataKeys(boundHandler)).toContain(RABBIT_HANDLER);
  });
});
