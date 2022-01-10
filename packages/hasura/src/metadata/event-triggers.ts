import {
  Columns,
  EventTriggerDefinition,
  TableEntry,
} from '../hasura-metadata-dist/HasuraMetadataV2';
import {
  HasuraModuleConfig,
  ScheduledEventRetryConfig,
  TrackedHasuraEventHandlerConfig,
} from '../hasura.interfaces';

const convertEventTriggerDefinition = (
  configDef: TrackedHasuraEventHandlerConfig['definition']
): EventTriggerDefinition => {
  if (configDef.type === 'insert') {
    return {
      enable_manual: false,
      insert: {
        columns: Columns.Empty,
      },
    };
  }

  if (configDef.type === 'delete') {
    return {
      enable_manual: false,
      delete: {
        columns: Columns.Empty,
      },
    };
  }

  return {
    enable_manual: false,
    update: {
      columns: configDef.columns ?? Columns.Empty,
    },
  };
};

export const mergeEventHandlerConfig = (
  config: TrackedHasuraEventHandlerConfig,
  moduleConfig: HasuraModuleConfig,
  defaultRetryConfig: ScheduledEventRetryConfig,
  existingTableEntry: TableEntry
): TableEntry['event_triggers'] => {
  const { managedMetaDataConfig } = moduleConfig;

  const { triggerName, definition, retryConfig = defaultRetryConfig } = config;

  const eventTriggers = (existingTableEntry.event_triggers ?? []).filter(
    (x) => x.name !== triggerName
  );

  const { intervalInSeconds, numRetries, timeoutInSeconds } = retryConfig;

  return [
    ...eventTriggers,
    {
      name: triggerName,
      definition: convertEventTriggerDefinition(definition),
      retry_conf: {
        num_retries: numRetries,
        interval_sec: intervalInSeconds,
        timeout_sec: timeoutInSeconds,
      },
      webhook_from_env: managedMetaDataConfig?.nestEndpointEnvName,
      headers: [
        {
          name: moduleConfig.webhookConfig.secretHeader,
          value_from_env: managedMetaDataConfig?.secretHeaderEnvName,
        },
      ],
    },
  ];
};
