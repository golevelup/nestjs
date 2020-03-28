import { makeInjectableDecorator } from '@golevelup/nestjs-common';
import { SetMetadata } from '@nestjs/common';
import { HASURA_EVENT_HANDLER, HASURA_MODULE_CONFIG } from './hasura.constants';
import { HasuraEventHandlerConfig } from './hasura.interfaces';

export const HasuraEventHandler = (config: HasuraEventHandlerConfig) => (
  target,
  key,
  descriptor
) => SetMetadata(HASURA_EVENT_HANDLER, config)(target, key, descriptor);

export const InjectHasuraConfig = makeInjectableDecorator(HASURA_MODULE_CONFIG);
