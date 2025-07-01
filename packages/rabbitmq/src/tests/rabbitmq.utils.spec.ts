import {
  validateRabbitMqUris,
  matchesRoutingKey,
  converUriConfigObjectsToUris,
} from '../amqp/utils';

describe(matchesRoutingKey.name, () => {
  const userCreated = 'user.created';

  it.each([
    // [description, routingKey, pattern, expectedResult]
    [
      'should return true when routing key matches star pattern',
      'user.created.new',
      'user.*.new',
      true,
    ],
    [
      'should return true when routing key matches hash pattern',
      'user.updated.new',
      'user.#',
      true,
    ],
    [
      'should return false when routing key does not match pattern',
      'user.updated',
      userCreated,
      false,
    ],
    [
      'should return true when routing key matches any star pattern in the array',
      userCreated,
      ['event.*', 'user.*'],
      true,
    ],
    [
      'should return true when routing key matches precise pattern in the array with wildcards',
      userCreated,
      ['user.*.new', userCreated, 'event.#'],
      true,
    ],
    [
      'should return true when routing key matches any hash pattern in the array',
      'user.created.new',
      ['event.#', 'user.#'],
      true,
    ],
    ['should return true with pattern as an empty string', '', '', true], //both are equal (empty strings) which is valid for an exact match
    [
      'should return false when routing key does not match any pattern in the array',
      'user.updated',
      [userCreated, 'event.created'],
      false,
    ],
    [
      'should return false when pattern is undefined',
      userCreated,
      undefined,
      false,
    ],
  ])('%s', (_, routingKey, pattern, expectedResult) => {
    const result = matchesRoutingKey(routingKey, pattern);
    expect(result).toBe(expectedResult);
  });
});

describe(validateRabbitMqUris.name, () => {
  it('should not throw with valid uris', () => {
    expect(() =>
      validateRabbitMqUris([
        'amqp://rabbitmq:rabbitmq@localhost:4444',
        'amqp://rabbitmq:rabbitmq@localhost:1234',
        'amqps://rabbitmq:rabbitmq@localhost:2345',
        'amqp://rabbitmq:rabbitmq@localhost:3456/',
        'amqps://rabbitmq:rabbitmq@localhost:4567/',
        // with virtual host
        'amqps://rabbitmq:rabbitmq@localhost:4567/vhost',
        'amqps://rabbitmq:rabbitmq@localhost:4567/v/h(o&s*t_',
        // With query parameters
        'amqp://rabbitmq:rabbitmq@localhost:5672?vhost=%2F&frameMax=131072&heartbeat=60',
        'amqps://rabbitmq:rabbitmq@localhost:5671/vhost?frameMax=131072&heartbeat=30',
        'amqps://rabbitmq:rabbitmq@localhost:5671/%2F?heartbeat=10',
        'amqps://user:pass@rabbit.example.com:5671/vhost?frameMax=65536&channelMax=2047',
      ]),
    ).not.toThrowError();
  });

  it('should throw when malformed uris are provided', () => {
    expect(() =>
      validateRabbitMqUris([
        'amqp://rabbitmq:rabbitmq@localhost:hello',
        'superbawl://rabbitmq:rabbitmq@localhost:4444',
      ]),
    ).toThrowError();
  });
});

describe(converUriConfigObjectsToUris.name, () => {
  it('should return array of uris', () => {
    expect(
      converUriConfigObjectsToUris([
        'amqp://rabbitmq:rabbitmq@localhost:hello',
      ]),
    ).toEqual(['amqp://rabbitmq:rabbitmq@localhost:hello']);

    expect(
      converUriConfigObjectsToUris([
        {
          hostname: 'localhost',
          username: 'rabbitmq_user',
          password: 'rabbitmq_password',
          port: 3,
          frameMax: 4,
          heartbeat: 5,
          protocol: 'amqp',
          locale: 'locale',
          vhost: '/vhost',
        },
      ]),
    ).toEqual([
      'amqp://rabbitmq_user:rabbitmq_password@localhost:3/vhost?frameMax=4&heartbeat=5',
    ]);
  });

  it('should return array when single value provided', () => {
    expect(
      converUriConfigObjectsToUris('amqp://rabbitmq:rabbitmq@localhost:hello'),
    ).toEqual(['amqp://rabbitmq:rabbitmq@localhost:hello']);

    expect(
      converUriConfigObjectsToUris({
        hostname: 'localhost',
        username: 'rabbitmq_user',
        password: 'rabbitmq_password',
        port: 3,
      }),
    ).toEqual(['amqp://rabbitmq_user:rabbitmq_password@localhost:3/?']);
  });

  it("should throw when hostname doesn't exist in uri objecct", () => {
    expect(() =>
      converUriConfigObjectsToUris({
        hostname: undefined,
      }),
    ).toThrowError(
      Error("Configuration object must contain a 'hostname' key."),
    );
  });
});
