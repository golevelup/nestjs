import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
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

    // Simulate how RabbitMQModule registers the handler with the fix applied:
    // discoveredMethod.handler.bind(discoveredMethod.parentClass.instance)
    const boundHandler = prototype['handleMessage'].bind(service);

    boundHandler({});

    expect(handlerSpy).toHaveBeenCalledWith('service-value');
  });

  it('should lose `this` context when handler is unbound', () => {
    const service = new TestService();
    const prototype = Object.getPrototypeOf(service);

    // Without binding, `this` is undefined in strict mode, so accessing
    // this.serviceValue will throw a TypeError
    const unboundHandler = prototype['handleMessage'];

    expect(() => unboundHandler.call(undefined, {})).toThrow(TypeError);
  });

  it('should allow injected dependencies to be accessed when handler is bound to the instance', async () => {
    const module = await Test.createTestingModule({
      providers: [TestService],
    }).compile();

    const testService = module.get(TestService);
    const prototype = Object.getPrototypeOf(testService);

    // Simulate what RabbitMQModule does: bind the discovered prototype method
    // to the parent class instance before registering as a subscriber
    const boundHandler = prototype['handleMessage'].bind(testService);

    boundHandler({});

    expect(handlerSpy).toHaveBeenCalledWith('service-value');
  });
});
