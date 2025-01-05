import { applyDecorators, Inject, SetMetadata } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from './hasura-module-definition';
import {
  HASURA_EVENT_HANDLER,
  HASURA_SCHEDULED_EVENT_HANDLER,
} from './hasura.constants';
import {
  HasuraEventHandlerConfig,
  TrackedHasuraEventHandlerConfig,
  TrackedHasuraScheduledEventHandlerConfig,
} from './hasura.interfaces';

export const HasuraEventHandler = (config: HasuraEventHandlerConfig) =>
  applyDecorators(SetMetadata(HASURA_EVENT_HANDLER, config));

export const InjectHasuraConfig = () => Inject(MODULE_OPTIONS_TOKEN);

export const TrackedHasuraEventHandler = (
  config: TrackedHasuraEventHandlerConfig,
) => applyDecorators(SetMetadata(HASURA_EVENT_HANDLER, config));

export const TrackedHasuraScheduledEventHandler = (
  config: TrackedHasuraScheduledEventHandlerConfig,
) =>
  applyDecorators(
    SetMetadata(HASURA_SCHEDULED_EVENT_HANDLER, config),
    SetMetadata(HASURA_EVENT_HANDLER, { triggerName: config.name }),
  );
