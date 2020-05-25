const exampleEvent = {
  id: 'ecd5fe4a-7113-4243-bb0e-6177c78a0033',
  table: { schema: 'public', name: 'user' },
  trigger: { name: 'user_created' },
  event: {
    session_variables: { 'x-hasura-role': 'admin' },
    op: 'INSERT',
    data: { old: null, new: [Object] },
  },
  delivery_info: { current_retry: 0, max_retries: 0 },
  created_at: '2020-02-20T01:12:12.789983Z',
};

export type EventOperation = 'INSERT' | 'UPDATE' | 'DELETE' | 'MANUAL';

type EventPayload = {
  session_variables: Record<string, string>;
  op: EventOperation;
  data: { old: unknown; new: unknown | unknown[] };
};

type TypedEventPayload<T> = Omit<EventPayload, 'data'> & {
  data: { old?: T; new: T | T[] };
};

export type HasuraEvent = Omit<typeof exampleEvent, 'event'> & {
  event: EventPayload;
};

export type TypedHasuraEvent<T> = Omit<HasuraEvent, 'event'> & {
  event: TypedEventPayload<T>;
};

export interface HasuraEventHandlerConfig {
  /**
   * @deprecated Table information for the event trigger which will will be used to route the event.
   * It is recommended to use `triggerName` instead as multiple events can use the same table which
   * makes routing to the correct handler more difficult
   */
  table?: { schema?: string; name: string };
  /**
   * The name of the Hasura Trigger which created this event
   */
  triggerName?: string;
}

export interface HasuraModuleConfig {
  secretHeader: string;
  secretFactory: (() => string) | string;
  enableEventLogs?: boolean;
  controllerPrefix?: string;
}

export type HasuraAction<T = Record<string, string>> = {
  action: {
    name: string;
  };
  session_variables: Record<string, string>;
  input: T;
};
