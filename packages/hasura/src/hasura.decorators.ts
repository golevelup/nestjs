import { makeInjectableDecorator } from '@golevelup/nestjs-common';
import { SetMetadata } from '@nestjs/common';
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

export const HasuraEventHandler = (config: HasuraEventHandlerConfig) => (
  target,
  key,
  descriptor
) => SetMetadata(HASURA_EVENT_HANDLER, config)(target, key, descriptor);

export const InjectHasuraConfig = makeInjectableDecorator(HASURA_MODULE_CONFIG);

export const TrackedHasuraEventHandler = (
  config: TrackedHasuraEventHandlerConfig
) => SetMetadata(HASURA_EVENT_HANDLER, config);

export const TrackedHasuraScheduledEventHandler = (
  config: TrackedHasuraScheduledEventHandlerConfig
) => (target, key, descriptor) => {
  SetMetadata(HASURA_SCHEDULED_EVENT_HANDLER, config)(target, key, descriptor);
  SetMetadata(HASURA_EVENT_HANDLER, { triggerName: config.name })(
    target,
    key,
    descriptor
  );
};
