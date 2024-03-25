import { matchesRoutingKey } from '../amqp/utils';

describe('matchesRoutingKey', () => {
  const userCreated = 'user.created';
  it('should return true when routing key matches star pattern', () => {
    const routingKey = 'user.created.new';
    const pattern = 'user.*.new';
    const result = matchesRoutingKey(routingKey, pattern);
    expect(result).toBe(true);
  });
  it('should return true when routing key matches hash pattern', () => {
    const routingKey = 'user.updated.new';
    const pattern = 'user.#';
    const result = matchesRoutingKey(routingKey, pattern);
    expect(result).toBe(true);
  });
  it('should return false when routing key does not match pattern', () => {
    const routingKey = 'user.updated';
    const pattern = userCreated;
    const result = matchesRoutingKey(routingKey, pattern);
    expect(result).toBe(false);
  });

  it('should return true when routing key matches any star pattern in the array', () => {
    const routingKey = userCreated;
    const pattern = ['event.*', 'user.*'];
    const result = matchesRoutingKey(routingKey, pattern);
    expect(result).toBe(true);
  });

  it('should return true when routing key matches precise pattern in the array with wildcards', () => {
    const routingKey = userCreated;
    const pattern = ['user.*.new', userCreated, 'event.#'];
    const result = matchesRoutingKey(routingKey, pattern);
    expect(result).toBe(true);
  });

  it('should return true when routing key matches any hash pattern in the array', () => {
    const routingKey = 'user.created.new';
    const pattern = ['event.#', 'user.#'];
    const result = matchesRoutingKey(routingKey, pattern);
    expect(result).toBe(true);
  });
  it('should return false when routing key does not match any pattern in the array', () => {
    const routingKey = 'user.updated';
    const pattern = [userCreated, 'event.created'];
    const result = matchesRoutingKey(routingKey, pattern);
    expect(result).toBe(false);
  });

  it('should return false when pattern is undefined', () => {
    const routingKey = userCreated;
    const pattern = undefined;
    const result = matchesRoutingKey(routingKey, pattern);
    expect(result).toBe(false);
  });
});
