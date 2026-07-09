import { Subscription } from '@google-cloud/pubsub';
import { PubsubClient } from '../src/client/pubsub.client';
import { PubsubSubscriptionContainer } from '../src/client/pubsub-subscription.container';
import { PubsubTopicContainer } from '../src/client/pubsub-topic.container';
import { ResourceState } from '../src/client/resource-manager';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function blockEventLoop(durationMs: number) {
  const end = Date.now() + durationMs;
  while (Date.now() < end) {}
}

function createMockSubscription() {
  const closeFn = jest.fn();
  const openFn = jest.fn();

  return {
    close: closeFn.mockResolvedValue(undefined),
    open: openFn,
    removeAllListeners: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    name: 'mock-subscription',
  } as unknown as Subscription & { close: jest.Mock; open: jest.Mock };
}

function injectSubscriptionContainer(
  client: PubsubClient,
  name: string,
  subscription: Subscription,
) {
  const containers = (client as any).subscriptionContainers as Map<
    string,
    PubsubSubscriptionContainer
  >;

  const container = new PubsubSubscriptionContainer(
    subscription,
    { name } as any,
    {} as PubsubTopicContainer,
  );

  containers.set(name, container);

  return container;
}

describe.skip('Adaptive Flow Control — Subscription Pause/Resume', () => {
  jest.setTimeout(30000);

  let client: PubsubClient;

  afterEach(async () => {
    await client?.close().catch(() => {});
  });

  it('should pause subscriptions on Critical and resume on recovery.', async () => {
    client = new PubsubClient({ adaptiveFlowControl: true });

    const mockSub = createMockSubscription();
    injectSubscriptionContainer(client, 'sub-1', mockSub);

    // Trigger initialize to register the resource manager listener.
    await client.initialize([]);

    await delay(1500);

    for (let i = 0; i < 5; i++) {
      blockEventLoop(300);
      await delay(100);
    }

    await delay(3000);

    expect(mockSub.close).toHaveBeenCalled();

    await delay(5000);

    expect(mockSub.open).toHaveBeenCalled();
  });

  it('should only pause on Critical, not on Pressure.', async () => {
    client = new PubsubClient({ adaptiveFlowControl: true });

    const mockSub = createMockSubscription();
    injectSubscriptionContainer(client, 'sub-1', mockSub);

    await client.initialize([]);

    const resourceManager = (client as any).resourceManager;

    resourceManager.emit('stateChanged', {
      previousState: ResourceState.Healthy,
      newState: ResourceState.Pressure,
      metrics: {} as any,
    });

    expect(mockSub.close).not.toHaveBeenCalled();
    expect(mockSub.open).not.toHaveBeenCalled();

    resourceManager.emit('stateChanged', {
      previousState: ResourceState.Pressure,
      newState: ResourceState.Critical,
      metrics: {} as any,
    });

    expect(mockSub.close).toHaveBeenCalledTimes(1);

    resourceManager.emit('stateChanged', {
      previousState: ResourceState.Critical,
      newState: ResourceState.Healthy,
      metrics: {} as any,
    });

    expect(mockSub.open).toHaveBeenCalledTimes(1);
  });

  it('should not re-open subscriptions if close() is called during Critical.', async () => {
    client = new PubsubClient({ adaptiveFlowControl: true });

    const mockSub = createMockSubscription();
    injectSubscriptionContainer(client, 'sub-1', mockSub);

    await client.initialize([]);

    const resourceManager = (client as any).resourceManager;

    // Simulate entering Critical state.
    resourceManager.emit('stateChanged', {
      previousState: ResourceState.Healthy,
      newState: ResourceState.Critical,
      metrics: {} as any,
    });

    expect(mockSub.close).toHaveBeenCalled();

    // Shut down while in Critical state — flag is reset, resourceManager stopped.
    await client.close();

    // Simulate recovery event after close (should be no-op since flag was reset).
    resourceManager.emit('stateChanged', {
      previousState: ResourceState.Critical,
      newState: ResourceState.Healthy,
      metrics: {} as any,
    });

    expect(mockSub.open).not.toHaveBeenCalled();
  });

  it('should pause and resume multiple subscriptions.', async () => {
    client = new PubsubClient({ adaptiveFlowControl: true });

    const mockSub1 = createMockSubscription();
    const mockSub2 = createMockSubscription();
    const mockSub3 = createMockSubscription();

    injectSubscriptionContainer(client, 'sub-1', mockSub1);
    injectSubscriptionContainer(client, 'sub-2', mockSub2);
    injectSubscriptionContainer(client, 'sub-3', mockSub3);

    await client.initialize([]);

    await delay(1500);

    for (let i = 0; i < 5; i++) {
      blockEventLoop(300);
      await delay(100);
    }

    await delay(3000);

    expect(mockSub1.close).toHaveBeenCalled();
    expect(mockSub2.close).toHaveBeenCalled();
    expect(mockSub3.close).toHaveBeenCalled();

    await delay(5000);

    expect(mockSub1.open).toHaveBeenCalled();
    expect(mockSub2.open).toHaveBeenCalled();
    expect(mockSub3.open).toHaveBeenCalled();
  });

  it('should handle rapid Critical transitions without errors.', async () => {
    client = new PubsubClient({ adaptiveFlowControl: true });

    const mockSub = createMockSubscription();
    injectSubscriptionContainer(client, 'sub-1', mockSub);

    await client.initialize([]);

    const resourceManager = (client as any).resourceManager;

    // Simulate rapid Critical in/out transitions directly.
    for (let i = 0; i < 10; i++) {
      resourceManager.emit('stateChanged', {
        previousState: ResourceState.Healthy,
        newState: ResourceState.Critical,
        metrics: {} as any,
      });

      resourceManager.emit('stateChanged', {
        previousState: ResourceState.Critical,
        newState: ResourceState.Healthy,
        metrics: {} as any,
      });
    }

    expect(mockSub.close).toHaveBeenCalledTimes(10);
    expect(mockSub.open).toHaveBeenCalledTimes(10);
  });
});
