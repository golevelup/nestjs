import { makeInjectableDecorator } from '@golevelup/nestjs-common';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import {
  HASURA_EVENT_HANDLER,
  HASURA_MODULE_CONFIG,
  HASURA_SCHEDULED_EVENT_HANDLER,
} from './hasura.constants';
import {
  HasuraEventHandlerConfig,
  TrackedHasuraEventHandlerConfig,
  TrackedHasuraScheduledEventHandlerConfig,
} from './hasura.interfaces';

export const HasuraEventHandler = (config: HasuraEventHandlerConfig) =>
  applyDecorators(SetMetadata(HASURA_EVENT_HANDLER, config));

export const InjectHasuraConfig = makeInjectableDecorator(HASURA_MODULE_CONFIG);

export const TrackedHasuraEventHandler = (
  config: TrackedHasuraEventHandlerConfig
) => applyDecorators(SetMetadata(HASURA_EVENT_HANDLER, config));

export const TrackedHasuraScheduledEventHandler = (
  config: TrackedHasuraScheduledEventHandlerConfig
) =>
  applyDecorators(
    SetMetadata(HASURA_SCHEDULED_EVENT_HANDLER, config),
    SetMetadata(HASURA_EVENT_HANDLER, { triggerName: config.name })
  );
