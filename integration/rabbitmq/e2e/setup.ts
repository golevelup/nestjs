import { GenericContainer, Wait } from 'testcontainers';

let stopContainer: (() => Promise<void>) | undefined;

async function setupImpl() {
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

  const stopContainerFn = async () => {
    await container.stop();
  };

  stopContainer = stopContainerFn;

  return stopContainerFn;
}

export default setupImpl;

export async function setup() {
  return setupImpl();
}

export async function teardown() {
  await stopContainer?.();
}
