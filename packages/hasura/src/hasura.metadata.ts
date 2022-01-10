import {
  HasuraEventHandlerConfig,
  HasuraModuleConfig,
  ScheduledEventRetryConfig,
  TrackedHasuraEventHandlerConfig,
  TrackedHasuraScheduledEventHandlerConfig,
} from './hasura.interfaces';
import { load, dump } from 'js-yaml';
import { readFileSync, writeFileSync } from 'fs';
import { orderBy } from 'lodash';
import {
  TableEntry,
  CronTrigger,
} from './hasura-metadata-dist/HasuraMetadataV2';
import { mergeEventHandlerConfig } from './metadata/event-triggers';

const utf8 = 'utf-8';

const MISSING_META_CONFIG = 'No configuration for meta available';

const defaultHasuraRetryConfig: ScheduledEventRetryConfig = {
  intervalInSeconds: 10,
  numRetries: 3,
  timeoutInSeconds: 60,
  toleranceSeconds: 21600,
};

export const isTrackedHasuraEventHandlerConfig = (
  eventHandlerConfig: HasuraEventHandlerConfig | TrackedHasuraEventHandlerConfig
): eventHandlerConfig is TrackedHasuraEventHandlerConfig => {
  return 'definition' in eventHandlerConfig;
};

const updateEventTriggerMetaV2 = (
  moduleConfig: HasuraModuleConfig,
  eventHandlerConfigs: TrackedHasuraEventHandlerConfig[]
) => {
  const { managedMetaDataConfig } = moduleConfig;

  if (!managedMetaDataConfig) {
    throw new Error(MISSING_META_CONFIG);
  }

  const defaultRetryConfig =
    managedMetaDataConfig.defaultEventRetryConfig ?? defaultHasuraRetryConfig;

  const tablesYamlPath = `${managedMetaDataConfig.dirPath}/tables.yaml`;

  const tablesMeta = readFileSync(tablesYamlPath, utf8);
  const tableEntries = load(tablesMeta) as TableEntry[];

  orderBy(eventHandlerConfigs, (x) => x.triggerName).forEach((config) => {
    const { schema = 'public', tableName } = config;

    const matchingTable = tableEntries.find(
      (x) => x.table.schema === schema && x.table.name === tableName
    );

    if (!matchingTable) {
      throw new Error(
        `Table '${tableName}' from schema '${schema}' not found in tables metadata`
      );
    }

    matchingTable.event_triggers = mergeEventHandlerConfig(
      config,
      moduleConfig,
      defaultRetryConfig,
      matchingTable
    );
  });

  const yamlString = dump(tableEntries);
  writeFileSync(tablesYamlPath, yamlString, utf8);
};

const updateEventTriggerMetaV3 = (
  moduleConfig: HasuraModuleConfig,
  eventHandlerConfigs: TrackedHasuraEventHandlerConfig[]
) => {
  const { managedMetaDataConfig } = moduleConfig;

  if (!managedMetaDataConfig) {
    throw new Error(MISSING_META_CONFIG);
  }

  const defaultRetryConfig =
    managedMetaDataConfig.defaultEventRetryConfig ?? defaultHasuraRetryConfig;

  eventHandlerConfigs.forEach((config) => {
    const { schema = 'public', databaseName = 'default', tableName } = config;

    const tableYamlPath = `${managedMetaDataConfig.dirPath}/databases/${databaseName}/tables/${schema}_${tableName}.yaml`;
    const tableMeta = readFileSync(tableYamlPath, utf8);
    const tableEntry = load(tableMeta) as TableEntry;

    tableEntry.event_triggers = mergeEventHandlerConfig(
      config,
      moduleConfig,
      defaultRetryConfig,
      tableEntry
    );

    const yamlString = dump(tableEntry);
    writeFileSync(tableYamlPath, yamlString, utf8);
  });
};

export const updateEventTriggerMeta = (
  moduleConfig: HasuraModuleConfig,
  eventHandlerConfigs: TrackedHasuraEventHandlerConfig[]
) => {
  const { managedMetaDataConfig } = moduleConfig;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { metadataVersion = 'v2' } = moduleConfig.managedMetaDataConfig!;

  if (!managedMetaDataConfig) {
    throw new Error(MISSING_META_CONFIG);
  }

  if (metadataVersion === 'v2') {
    updateEventTriggerMetaV2(moduleConfig, eventHandlerConfigs);
  } else if (metadataVersion === 'v3') {
    updateEventTriggerMetaV3(moduleConfig, eventHandlerConfigs);
  } else {
    throw new Error(`Invalid Hasura metadata version: ${metadataVersion}`);
  }
};

export const updateScheduledEventTriggerMeta = (
  moduleConfig: HasuraModuleConfig,
  scheduledEventHandlerConfigs: TrackedHasuraScheduledEventHandlerConfig[]
) => {
  const { managedMetaDataConfig } = moduleConfig;

  if (!managedMetaDataConfig) {
    throw new Error(MISSING_META_CONFIG);
  }

  const cronTriggersYamlPath = `${managedMetaDataConfig.dirPath}/cron_triggers.yaml`;

  const cronTriggersMeta = readFileSync(cronTriggersYamlPath, utf8);
  const cronEntries = (load(cronTriggersMeta) ?? []) as CronTrigger[];

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

  const yamlString = dump(newCronEntries);
  writeFileSync(cronTriggersYamlPath, yamlString, utf8);
};
