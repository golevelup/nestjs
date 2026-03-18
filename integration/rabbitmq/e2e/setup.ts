import { GenericContainer, Wait } from 'testcontainers';

export default async function setup() {
  const container = await new GenericContainer('rabbitmq:3-management')
    .withEnvironment({
      RABBITMQ_DEFAULT_USER: 'rabbitmq',
      RABBITMQ_DEFAULT_PASS: 'rabbitmq',
    })
    .withExposedPorts(5672)
    .withWaitStrategy(Wait.forListeningPorts())
    .start();

  process.env.RABBITMQ_HOST = container.getHost();
  process.env.RABBITMQ_PORT = String(container.getMappedPort(5672));

  return async () => {
    await container.stop();
  };
}
