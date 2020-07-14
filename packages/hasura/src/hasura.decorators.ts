import { makeInjectableDecorator } from '@golevelup/nestjs-common';
import { SetMetadata } from '@nestjs/common';
import {
  HASURA_EVENT_HANDLER,
  HASURA_ACTION_HANDLER,
  HASURA_MODULE_CONFIG,
  HASURA_ACTION_INPUT_SDL,
} from './hasura.constants';
import {
  HasuraEventHandlerConfig,
  HasuraActionSdl,
  HasuraActionHandlerConfig,
} from './hasura.events.interfaces';

/**
 * Method decorator that enables Hasura Events with a matching trigger name
 * to be automatically wired up to handle those events
 * @param actionName The name of the matching event trigger
 */
export const HasuraEventHandler = (config: HasuraEventHandlerConfig) => (
  target,
  key,
  descriptor
) => SetMetadata(HASURA_EVENT_HANDLER, config)(target, key, descriptor);

/**
 * Method decorator that enables Hasura Actions with a matching action name
 * to be automatically wired up to handle those actions
 * @param actionName The name of the matching action
 */
export const HasuraActionHandler = (
  actionConfig: HasuraActionHandlerConfig = {}
) => (target, key, descriptor) =>
  SetMetadata(HASURA_ACTION_HANDLER, actionConfig)(target, key, descriptor);

export const HasuraActionInputSDL = (definition: HasuraActionSdl) =>
  SetMetadata(HASURA_ACTION_INPUT_SDL, definition);

/**
 * Method Parameter decorator that can be used to inject the Hasura Module configuration
 * into any NestJS Injectables that might be interested in it
 */
export const InjectHasuraConfig = makeInjectableDecorator(HASURA_MODULE_CONFIG);
