import { GenericContainer, Wait } from 'testcontainers';
import { provide } from 'vitest/node';

export default async function setup() {
  const container = await new GenericContainer('rabbitmq:3-management')
    .withEnvironment({
      RABBITMQ_DEFAULT_USER: 'rabbitmq',
      RABBITMQ_DEFAULT_PASS: 'rabbitmq',
    })
    .withExposedPorts(5672)
    .withWaitStrategy(Wait.forListeningPorts())
    .start();

  provide('RABBITMQ_HOST', container.getHost());
  provide('RABBITMQ_PORT', String(container.getMappedPort(5672)));

  return async () => {
    await container.stop();
  };
}
