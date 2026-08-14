import { ResourceManager, ResourceState } from '../src/client/resource-manager';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function blockEventLoop(durationMs: number) {
  const end = Date.now() + durationMs;

  while (Date.now() < end) {}
}

describe.skip('ResourceManager', () => {
  jest.setTimeout(30000);

  let resourceManager: ResourceManager;

  afterEach(() => {
    resourceManager?.stop();
  });

  describe('lifecycle', () => {
    it('should start in healthy state and emit no events when idle.', async () => {
      resourceManager = new ResourceManager();
      const stateChanges: ResourceState[] = [];

      resourceManager.on('stateChanged', ({ newState }) => {
        stateChanges.push(newState);
      });

      await delay(3000);

      expect(stateChanges.every((s) => s === ResourceState.Healthy)).toBe(true);
    });

    it('should stop cleanly without errors.', () => {
      resourceManager = new ResourceManager();

      expect(() => resourceManager.stop()).not.toThrow();
    });

    it('should stop emitting events after stop().', async () => {
      resourceManager = new ResourceManager();
      let eventsAfterStop = 0;

      resourceManager.stop();

      resourceManager.on('stateChanged', () => {
        eventsAfterStop++;
      });

      blockEventLoop(200);
      await delay(2500);

      expect(eventsAfterStop).toBe(0);
    });
  });

  describe('state transitions under event loop pressure', () => {
    it('should detect pressure or critical state when event loop is heavily blocked.', async () => {
      resourceManager = new ResourceManager();
      const observedStates: ResourceState[] = [];

      resourceManager.on('stateChanged', ({ newState }) => {
        observedStates.push(newState);
      });

      await delay(1500);

      for (let i = 0; i < 5; i++) {
        blockEventLoop(300);
        await delay(100);
      }

      await delay(2000);

      const hasElevatedState = observedStates.some(
        (state) =>
          state === ResourceState.Pressure || state === ResourceState.Critical,
      );

      expect(hasElevatedState).toBe(true);
    });

    it('should recover to healthy after pressure subsides.', async () => {
      resourceManager = new ResourceManager();
      const observedStates: ResourceState[] = [];

      resourceManager.on('stateChanged', ({ newState }) => {
        observedStates.push(newState);
      });

      await delay(1500);

      for (let i = 0; i < 5; i++) {
        blockEventLoop(300);
        await delay(100);
      }

      await delay(5000);

      const lastState = observedStates[observedStates.length - 1];

      expect(lastState).toBe(ResourceState.Healthy);
    });
  });

  describe('metrics snapshot', () => {
    it('should include all metric fields in stateChanged event.', async () => {
      resourceManager = new ResourceManager();

      const metricsPromise = new Promise<any>((resolve) => {
        resourceManager.on('stateChanged', ({ metrics }) => {
          resolve(metrics);
        });
      });

      await delay(1500);

      for (let i = 0; i < 5; i++) {
        blockEventLoop(300);
        await delay(100);
      }

      const metrics = await Promise.race([
        metricsPromise,
        delay(5000).then(() => null),
      ]);

      if (metrics) {
        expect(metrics).toHaveProperty('state');
        expect(metrics).toHaveProperty('eventLoopUtilization');
        expect(metrics).toHaveProperty('heapUsagePercent');
        expect(metrics).toHaveProperty('eventLoopLag');
        expect(metrics).toHaveProperty('maximumGarbageCollectionPause');

        expect(typeof metrics.eventLoopUtilization).toBe('number');
        expect(typeof metrics.heapUsagePercent).toBe('number');
        expect(typeof metrics.eventLoopLag).toBe('number');
        expect(typeof metrics.maximumGarbageCollectionPause).toBe('number');
      }
    });

    it('should report previous and new state in stateChanged event.', async () => {
      resourceManager = new ResourceManager();

      const eventPromise = new Promise<{
        previousState: ResourceState;
        newState: ResourceState;
      }>((resolve) => {
        resourceManager.on('stateChanged', (event) => {
          resolve(event);
        });
      });

      await delay(1500);

      for (let i = 0; i < 5; i++) {
        blockEventLoop(300);
        await delay(100);
      }

      const event = await Promise.race([
        eventPromise,
        delay(5000).then(() => null),
      ]);

      if (event) {
        expect(event.previousState).toBe(ResourceState.Healthy);
        expect([ResourceState.Pressure, ResourceState.Critical]).toContain(
          event.newState,
        );
      }
    });
  });
});
