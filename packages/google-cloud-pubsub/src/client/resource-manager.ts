import { EventEmitter } from 'node:events';
import {
  performance,
  PerformanceObserver,
  monitorEventLoopDelay,
  IntervalHistogram,
} from 'node:perf_hooks';
import { getHeapStatistics } from 'node:v8';

export enum ResourceState {
  Healthy = 'healthy',
  Pressure = 'pressure',
  Critical = 'critical',
}

export interface ResourceMetricsSnapshot {
  state: ResourceState;
  eventLoopUtilization: number;
  heapUsagePercent: number;
  eventLoopLag: number;
  maximumGarbageCollectionPause: number;
}

interface ResourceManagerEvents {
  stateChanged: [
    {
      previousState: ResourceState;
      newState: ResourceState;
      metrics: ResourceMetricsSnapshot;
    },
  ];
}

export class ResourceManager extends EventEmitter<ResourceManagerEvents> {
  private readonly CHECK_INTERVAL_MILLISECONDS = 1000;
  private readonly PRESSURE_THRESHOLD = 0.7;
  private readonly CRITICAL_THRESHOLD = 0.9;
  private readonly LAG_CRITICAL_THRESHOLD_MILLISECONDS = 100;

  private lastEventLoopUtilizationSnapshot = performance.eventLoopUtilization();

  private readonly eventLoopLagHistogram: IntervalHistogram;
  private readonly garbageCollectionObserver: PerformanceObserver;
  private readonly monitoringTicker: NodeJS.Timeout;

  private currentMaximumGarbageCollectionPause = 0;
  private currentResourceState: ResourceState = ResourceState.Healthy;

  constructor() {
    super();

    this.eventLoopLagHistogram = monitorEventLoopDelay({ resolution: 10 });
    this.eventLoopLagHistogram.enable();

    this.garbageCollectionObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.currentMaximumGarbageCollectionPause = Math.max(
          this.currentMaximumGarbageCollectionPause,
          entry.duration,
        );
      }
    });

    this.garbageCollectionObserver.observe({
      entryTypes: ['gc'],
      buffered: true,
    });

    this.monitoringTicker = setInterval(
      () => this.tick(),
      this.CHECK_INTERVAL_MILLISECONDS,
    );

    this.monitoringTicker.unref();
  }

  public stop(): void {
    clearInterval(this.monitoringTicker);

    this.eventLoopLagHistogram.disable();
    this.garbageCollectionObserver.disconnect();
  }

  private tick(): void {
    const snapshot = this.getResourceMetricsSnapshot();

    if (snapshot.state !== this.currentResourceState) {
      const previousState = this.currentResourceState;
      this.currentResourceState = snapshot.state;

      this.emit('stateChanged', {
        previousState: previousState,
        newState: this.currentResourceState,
        metrics: snapshot,
      });
    }

    this.currentMaximumGarbageCollectionPause = 0;
    this.eventLoopLagHistogram.reset();
  }

  private getResourceMetricsSnapshot(): ResourceMetricsSnapshot {
    const currentUtilizationSnapshot = performance.eventLoopUtilization();

    const utilizationDifference = performance.eventLoopUtilization(
      currentUtilizationSnapshot,
      this.lastEventLoopUtilizationSnapshot,
    );

    this.lastEventLoopUtilizationSnapshot = currentUtilizationSnapshot;

    const heapStatistics = getHeapStatistics();
    const heapUsagePercent =
      heapStatistics.used_heap_size / heapStatistics.heap_size_limit;

    const eventLoopLag = this.eventLoopLagHistogram.percentile(95) / 1e6;

    let state = ResourceState.Healthy;

    const isCritical =
      utilizationDifference.utilization > this.CRITICAL_THRESHOLD ||
      heapUsagePercent > this.CRITICAL_THRESHOLD ||
      eventLoopLag > this.LAG_CRITICAL_THRESHOLD_MILLISECONDS ||
      this.currentMaximumGarbageCollectionPause >
        this.LAG_CRITICAL_THRESHOLD_MILLISECONDS;

    const isUnderPressure =
      utilizationDifference.utilization > this.PRESSURE_THRESHOLD ||
      heapUsagePercent > this.PRESSURE_THRESHOLD;

    if (isCritical) {
      state = ResourceState.Critical;
    } else if (isUnderPressure) {
      state = ResourceState.Pressure;
    }

    return {
      state,
      eventLoopUtilization: utilizationDifference.utilization,
      heapUsagePercent,
      eventLoopLag,
      maximumGarbageCollectionPause: this.currentMaximumGarbageCollectionPause,
    };
  }
}
