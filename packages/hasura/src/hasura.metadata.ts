import {
  HasuraEventHandlerConfig,
  HasuraModuleConfig,
  ScheduledEventRetryConfig,
  TrackedHasuraEventHandlerConfig,
  TrackedHasuraScheduledEventHandlerConfig,
} from './hasura.interfaces';
import { safeLoad, safeDump } from 'js-yaml';
import { readFileSync, writeFileSync } from 'fs';
import {
  TableEntry,
  EventTriggerDefinition,
  Columns,
  CronTrigger,
} from './hasura-metadata-dist/HasuraMetadataV2';

const utf8 = 'utf-8';

const defaultHasuraRetryConfig: ScheduledEventRetryConfig = {
  intervalInSeconds: 10,
  numRetries: 3,
  timeoutInSeconds: 60,
  toleranceSeconds: 21600,
};

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

export const isTrackedHasuraEventHandlerConfig = (
  eventHandlerConfig: HasuraEventHandlerConfig | TrackedHasuraEventHandlerConfig
): eventHandlerConfig is TrackedHasuraEventHandlerConfig => {
  return 'definition' in eventHandlerConfig;
};

export const updateEventTriggerMeta = (
  moduleConfig: HasuraModuleConfig,
  eventHandlerConfigs: TrackedHasuraEventHandlerConfig[]
) => {
  const { managedMetaDataConfig } = moduleConfig;

  if (!managedMetaDataConfig) {
    throw new Error('No configuration for meta available');
  }

  const defaultRetryConfig =
    managedMetaDataConfig.defaultEventRetryConfig ?? defaultHasuraRetryConfig;

  const tablesYamlPath = `${managedMetaDataConfig.dirPath}/tables.yaml`;

  const tablesMeta = readFileSync(tablesYamlPath, utf8);
  const tableEntries = safeLoad(tablesMeta) as TableEntry[];

  eventHandlerConfigs.forEach((config) => {
    const {
      schema = 'public',
      tableName,
      triggerName,
      definition,
      retryConfig = defaultRetryConfig,
    } = config;
    const matchingTable = tableEntries.find(
      (x) => x.table.schema === schema && x.table.name === tableName
    );

    if (!matchingTable) {
      throw new Error(
        `Table '${tableName}' from schema '${schema}' not found in tables metadata`
      );
    }

    const { intervalInSeconds, numRetries, timeoutInSeconds } = retryConfig;
    const eventTriggers = (matchingTable.event_triggers ?? []).filter(
      (x) => x.name !== triggerName
    );

    matchingTable.event_triggers = [
      ...eventTriggers,
      {
        name: triggerName,
        webhook_from_env: managedMetaDataConfig.nestEndpointEnvName,
        headers: [
          {
            name: moduleConfig.webhookConfig.secretHeader,
            value_from_env: managedMetaDataConfig.secretHeaderEnvName,
          },
        ],
        retry_conf: {
          interval_sec: intervalInSeconds,
          num_retries: numRetries,
          timeout_sec: timeoutInSeconds,
        },
        definition: convertEventTriggerDefinition(definition),
      },
    ];
  });

  const yamlString = safeDump(tableEntries);
  writeFileSync(tablesYamlPath, yamlString, utf8);
};

export const updateScheduledEventTriggerMeta = (
  moduleConfig: HasuraModuleConfig,
  scheduledEventHandlerConfigs: TrackedHasuraScheduledEventHandlerConfig[]
) => {
  const { managedMetaDataConfig } = moduleConfig;

  if (!managedMetaDataConfig) {
    throw new Error('No configuration for meta available');
  }

  const cronTriggersYamlPath = `${managedMetaDataConfig.dirPath}/cron_triggers.yaml`;

  const cronTriggersMeta = readFileSync(cronTriggersYamlPath, utf8);
  const cronEntries = (safeLoad(cronTriggersMeta) ?? []) as CronTrigger[];

  const managedCronTriggerNames = scheduledEventHandlerConfigs.map(
    (x) => x.name
  );

  const defaultRetryConfig =
    managedMetaDataConfig.defaultEventRetryConfig ?? defaultHasuraRetryConfig;

  const managedCronTriggers: CronTrigger[] = scheduledEventHandlerConfigs.map(
    ({
      name,
      payload,
      comment,
      cronSchedule,
      retryConfig = defaultRetryConfig,
    }) => {
      return {
        name,
        payload,
        comment,
        schedule: cronSchedule,
        include_in_metadata: true,
        headers: [
          {
            name: moduleConfig.webhookConfig.secretHeader,
            value_from_env: managedMetaDataConfig.secretHeaderEnvName,
          },
        ],
        webhook: `{{${managedMetaDataConfig.nestEndpointEnvName}}}`,
        retry_conf: {
          num_retries: retryConfig.numRetries,
          retry_interval_seconds: retryConfig.intervalInSeconds,
          timeout_seconds: retryConfig.timeoutInSeconds,
          tolerance_seconds: retryConfig.toleranceSeconds,
        },
      };
    }
  );

  const newCronEntries: CronTrigger[] = [
    ...cronEntries.filter((x) => !managedCronTriggerNames.includes(x.name)),
    ...managedCronTriggers,
  ];

  const yamlString = safeDump(newCronEntries);
  writeFileSync(cronTriggersYamlPath, yamlString, utf8);
};
