import { assertRabbitMqUri, matchesRoutingKey } from '../amqp/utils';

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

  describe(assertRabbitMqUri.name, () => {
    it('should not throw with valid uris', () => {
      expect(() =>
        assertRabbitMqUri('amqp://rabbitmq:rabbitmq@localhost:4444'),
      ).not.toThrowError();

      expect(() =>
        assertRabbitMqUri([
          'amqp://rabbitmq:rabbitmq@localhost:4444',
          'amqp://rabbitmq:rabbitmq@localhost:1234',
          'amqps://rabbitmq:rabbitmq@localhost:2345',
          'amqp://rabbitmq:rabbitmq@localhost:3456/',
          'amqps://rabbitmq:rabbitmq@localhost:4567/',
          'amqps://rabbitmq:rabbitmq@localhost:4567/vhost',
          'amqps://rabbitmq:rabbitmq@localhost:4567/v/h(o&s*t_',
        ]),
      ).not.toThrowError();
    });

    it('should throw when malformed uris are provided', () => {
      expect(() =>
        assertRabbitMqUri('xamqp://rabbitmq:rabbitmq@localhost:4444'),
      ).toThrowError();
      expect(() =>
        assertRabbitMqUri([
          'amqp://rabbitmq:rabbitmq@localhost:hello',
          'superbawl://rabbitmq:rabbitmq@localhost:4444',
        ]),
      ).toThrowError();
    });
  });
});
