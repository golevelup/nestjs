import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import { createConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import {
  BadRequestException,
  Logger,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { flatten, groupBy } from 'lodash';
import { HASURA_EVENT_HANDLER, HASURA_MODULE_CONFIG } from './hasura.constants';
import { InjectHasuraConfig } from './hasura.decorators';
import { EventHandlerController } from './hasura.event-handler.controller';
import { HasuraEventHandlerHeaderGuard } from './hasura.event-handler.guard';
import { EventHandlerService } from './hasura.event-handler.service';
import {
  HasuraEvent,
  HasuraEventHandlerConfig,
  HasuraModuleConfig,
  HasuraScheduledEventPayload,
} from './hasura.interfaces';

function isHasuraEvent(value: any): value is HasuraEvent {
  return ['trigger', 'table', 'event'].every((it) => it in value);
}

function isHasuraScheduledEventPayload(
  value: any
): value is HasuraScheduledEventPayload {
  return ['name', 'scheduled_time', 'payload'].every((it) => it in value);
}

@Module({
  imports: [DiscoveryModule],
  controllers: [EventHandlerController],
})
export class HasuraModule
  extends createConfigurableDynamicRootModule<HasuraModule, HasuraModuleConfig>(
    HASURA_MODULE_CONFIG,
    {
      providers: [
        {
          provide: Symbol('CONTROLLER_HACK'),
          useFactory: (config: HasuraModuleConfig) => {
            const controllerPrefix = config.controllerPrefix || 'hasura';

            Reflect.defineMetadata(
              PATH_METADATA,
              controllerPrefix,
              EventHandlerController
            );
          },
          inject: [HASURA_MODULE_CONFIG],
        },
        EventHandlerService,
        HasuraEventHandlerHeaderGuard,
      ],
    }
  )
  implements OnModuleInit {
  private readonly logger = new Logger(HasuraModule.name);

  constructor(
    private readonly discover: DiscoveryService,
    private readonly externalContextCreator: ExternalContextCreator,
    @InjectHasuraConfig()
    private readonly hasuraModuleConfig: HasuraModuleConfig
  ) {
    super();
  }

  public async onModuleInit() {
    this.logger.log('Initializing Hasura Module');

    const eventHandlerMeta = await this.discover.providerMethodsWithMetaAtKey<
      HasuraEventHandlerConfig
    >(HASURA_EVENT_HANDLER);

    const grouped = groupBy(
      eventHandlerMeta,
      (x) => x.discoveredMethod.parentClass.name
    );

    const eventHandlers = flatten(
      Object.keys(grouped).map((x) => {
        this.logger.log(`Registering hasura event handlers from ${x}`);

        return grouped[x].map(({ discoveredMethod, meta: config }) => {
          if (!config.table && !config.triggerName) {
            throw new Error(
              'Hasura Event Handler is invalid. Specify either trigger name or table mapping'
            );
          }

          if (config.table) {
            this.logger.warn(
              `Event binding based on schema and table is deprecated and will be removed in a future release. Consider replacing the binding on ${discoveredMethod.methodName} with triggerName`
            );
          }

          if (config.table && config.triggerName) {
            this.logger.warn(
              `Both table and trigger bindings are set for ${discoveredMethod.methodName}. This is not recommended and will cause duplicate message processing`
            );
          }

          const key =
            config.triggerName ||
            `${config.table?.schema ? config.table?.schema : 'public'}-${
              config.table?.name
            }`;

          return {
            key,
            handler: this.externalContextCreator.create(
              discoveredMethod.parentClass.instance,
              discoveredMethod.handler,
              discoveredMethod.methodName
            ),
          };
        });
      })
    );

    const [eventHandlerServiceInstance] = await (
      await this.discover.providers((x) => x.name === EventHandlerService.name)
    ).map((x) => x.instance);

    const eventHandlerService = eventHandlerServiceInstance as EventHandlerService;

    const handleEvent = (
      evt: Partial<HasuraEvent> | HasuraScheduledEventPayload
    ) => {
      const keys = isHasuraEvent(evt)
        ? [evt.trigger?.name, `${evt?.table?.schema}-${evt?.table?.name}`]
        : isHasuraScheduledEventPayload(evt)
        ? [evt.name]
        : null;
      if (!keys) throw new Error('Not a Hasura Event');

      // TODO: this should use a map for faster lookups
      const handlers = eventHandlers.filter((x) => keys.includes(x.key));

      if (this.hasuraModuleConfig.enableEventLogs) {
        this.logger.log(`Received event for: ${keys}`);
      }

      if (handlers && handlers.length) {
        return Promise.all(handlers.map((x) => x.handler(evt)));
      } else {
        const errorMessage = `Handler not found for ${keys}`;
        this.logger.error(errorMessage);
        throw new BadRequestException(errorMessage);
      }
    };

    eventHandlerService.handleEvent = handleEvent;
  }
}
