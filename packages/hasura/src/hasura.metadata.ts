import {
  HasuraEventHandlerConfig,
  HasuraModuleConfig,
  ScheduledEventRetryConfig,
  TrackedHasuraEventHandlerConfig,
  TrackedHasuraScheduledEventHandlerConfig,
} from './hasura.interfaces';
import { safeLoad, safeDump } from 'js-yaml';
import { readFileSync, writeFileSync } from 'fs';
import { orderBy } from 'lodash';
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

  const tablesIndexYamlPath = `${managedMetaDataConfig.dirPath}/tables.yaml`;

  const tablesIndexFile = readFileSync(tablesIndexYamlPath, utf8);
  const tableIncludes = safeLoad(tablesIndexFile) as string[];

  // TODO is there a better way to handle includes?
  const tableEntries = tableIncludes
    .map((tableInclude) => tableInclude.replace('!include ', ''))
    .map((tableIncludePath) => {
      const path = `${managedMetaDataConfig.dirPath}/${tableIncludePath}`;
      const tableFile = readFileSync(
        `${managedMetaDataConfig.dirPath}/${tableIncludePath}`,
        utf8
      );
      return { meta: safeLoad(tableFile) as TableEntry, path };
    });

  orderBy(eventHandlerConfigs, (x) => x.triggerName).forEach((config) => {
    const {
      schema = 'public',
      tableName,
      triggerName,
      definition,
      retryConfig = defaultRetryConfig,
    } = config;
    const matchingTable = tableEntries.find(
      (x) => x.meta.table.schema === schema && x.meta.table.name === tableName
    );

    if (!matchingTable) {
      throw new Error(
        `Table '${tableName}' from schema '${schema}' not found in tables metadata`
      );
    }

    const { intervalInSeconds, numRetries, timeoutInSeconds } = retryConfig;
    const eventTriggers = (matchingTable.meta.event_triggers ?? []).filter(
      (x) => x.name !== triggerName
    );

    matchingTable.meta.event_triggers = [
      ...eventTriggers,
      {
        name: triggerName,
        definition: convertEventTriggerDefinition(definition),
        retry_conf: {
          num_retries: numRetries,
          interval_sec: intervalInSeconds,
          timeout_sec: timeoutInSeconds,
        },
        webhook_from_env: managedMetaDataConfig.nestEndpointEnvName,
        headers: [
          {
            name: moduleConfig.webhookConfig.secretHeader,
            value_from_env: managedMetaDataConfig.secretHeaderEnvName,
          },
        ],
      },
    ];
  });

  tableEntries.forEach((tableEntry) => {
    const yamlString = safeDump(tableEntry.meta);
    writeFileSync(tableEntry.path, yamlString, utf8);
  });
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
        webhook: `{{${managedMetaDataConfig.nestEndpointEnvName}}}`,
        schedule: cronSchedule,
        include_in_metadata: true,
        payload,
        retry_conf: {
          num_retries: retryConfig.numRetries,
          timeout_seconds: retryConfig.timeoutInSeconds,
          tolerance_seconds: retryConfig.toleranceSeconds,
          retry_interval_seconds: retryConfig.intervalInSeconds,
        },
        headers: [
          {
            name: moduleConfig.webhookConfig.secretHeader,
            value_from_env: managedMetaDataConfig.secretHeaderEnvName,
          },
        ],
        comment,
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
