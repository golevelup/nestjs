export const HASURA_EVENT_HANDLER = Symbol('HASURA_EVENT_HANDLER');
export const HASURA_MODULE_CONFIG = Symbol('HASURA_MODULE_CONFIG');
export const HASURA_SERVICE_CONFIG = Symbol('HASURA_MODULE_CONFIG');
export const HASURA_SCHEDULED_EVENT_HANDLER = Symbol(
  'HASURA_SCHEDULED_EVENT_HANDLER'
);

// We need string literal
export const enum ScheduledEventRequest {
  CREATE_SCHEDULED_EVENT = 'create_scheduled_event',
  DELETE_SCHEDULED_EVENT = 'delete_scheduled_event',
}
export const enum ScheduledEventMode {
  ONE_OFF = 'one_off',
  CRON = 'cron',
}
