import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import {
  createConfigurableDynamicRootModule,
  IConfigurableDynamicRootModule,
} from '@golevelup/nestjs-modules';
import { Logger, Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { fromPairs } from 'lodash';
import {
  GRAPHILE_WORKER_CONFIG_TOKEN,
  GRAPHILE_WORKER_HANDLER_TOKEN,
  GRAPHILE_WORKER_UTILS_TOKEN,
} from './graphile-worker.constants';
import {
  GraphileWorkerConfig,
  GraphileWorkerHandlerOptions,
} from './graphile-worker.interfaces';
import { makeWorkerUtils, parseCronItems, run, Runner } from 'graphile-worker';
import { InjectGraphileWorkerConfig } from './graphile-worker.decorators';

declare const placeholder: IConfigurableDynamicRootModule<
  GraphileWorkerModule,
  GraphileWorkerConfig
>;

@Module({
  imports: [DiscoveryModule],
})
export class GraphileWorkerModule
  extends createConfigurableDynamicRootModule<
    GraphileWorkerModule,
    GraphileWorkerConfig
  >(GRAPHILE_WORKER_CONFIG_TOKEN, {
    providers: [
      {
        provide: GRAPHILE_WORKER_UTILS_TOKEN,
        useFactory: async (config: GraphileWorkerConfig) => {
          const workerUtils = await makeWorkerUtils({
            connectionString: config.connectionString,
          });

          return workerUtils;
        },
        inject: [GRAPHILE_WORKER_CONFIG_TOKEN],
      },
    ],
    exports: [GRAPHILE_WORKER_UTILS_TOKEN],
  })
  implements OnModuleDestroy, OnModuleInit {
  private readonly logger = new Logger(GraphileWorkerModule.name);
  private runner!: Runner;

  constructor(
    private readonly discover: DiscoveryService,
    @InjectGraphileWorkerConfig() private readonly config: GraphileWorkerConfig
  ) {
    super();
  }

  async onModuleDestroy() {
    this.logger.log('Stopping Graphile Workers runner');
    await this.runner.stop();
  }

  public async onModuleInit() {
    this.logger.log('Initializing Graphile Workers');

    const workerMeta = await this.discover.providerMethodsWithMetaAtKey<
      GraphileWorkerHandlerOptions
    >(GRAPHILE_WORKER_HANDLER_TOKEN);

    for (const meta of workerMeta) {
      this.logger.verbose(
        `Found worker '${meta.discoveredMethod.parentClass.name}:${meta.discoveredMethod.methodName}' handling job '${meta.meta.name}'`
      );
    }

    const parsedCronItems = parseCronItems(
      workerMeta
        .filter((x) => Boolean(x.meta.cron))
        .map((x) => ({
          task: x.meta.name,
          ...x.meta.cron!,
        }))
    );

    this.runner = await run({
      noHandleSignals: false,
      ...this.config,
      taskList: fromPairs(
        workerMeta.map((x) => [x.meta.name, x.discoveredMethod.handler])
      ),
      parsedCronItems,
    });
  }
}
