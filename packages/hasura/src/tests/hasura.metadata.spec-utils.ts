import { Injectable } from '@nestjs/common';
import {
  TrackedHasuraEventHandler,
  TrackedHasuraScheduledEventHandler,
} from '../hasura.decorators';
import { CommonCronSchedules, HasuraModuleConfig } from '../hasura.interfaces';
import * as path from 'path';
import * as fs from 'fs';

import { z } from 'zod';
import { load } from 'js-yaml';

export const metadataVersion = z.enum(['v2', 'v3']);

export const baseConfig = {
  webhookConfig: {
    secretFactory: 'secret',
    secretHeader: 'NESTJS_SECRET_HEADER',
  },
  managedMetaDataConfig: {
    secretHeaderEnvName: 'NESTJS_WEBHOOK_SECRET_HEADER_VALUE',
    nestEndpointEnvName: 'NESTJS_EVENT_WEBHOOK_ENDPOINT',
    defaultEventRetryConfig: {
      intervalInSeconds: 15,
      numRetries: 3,
      timeoutInSeconds: 100,
      toleranceSeconds: 21600,
    },
  },
};

export const yamlFileToJson = (filePath: string) => {
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  return load(fileContents);
};

export const getVersionedMetadataPathAndConfig = (
  v: string
): [string, HasuraModuleConfig] => {
  const version = metadataVersion.parse(v);
  const metadataPath = path.join(
    __dirname,
    `../../test/__fixtures__/hasura/${version}/metadata`
  );

  const { managedMetaDataConfig } = baseConfig;
  return [
    metadataPath,
    {
      ...baseConfig,
      managedMetaDataConfig: {
        dirPath: metadataPath,
        metadataVersion: version,
        ...managedMetaDataConfig,
      },
    },
  ];
};

export const copyCleanTemplateYamlFile = (yamlPath: string) => {
  if (fs.existsSync(yamlPath)) {
    fs.unlinkSync(yamlPath);
  }
  fs.copyFileSync(`${yamlPath}.tmpl`, yamlPath);
};

@Injectable()
export class TestEventHandlerService {
  @TrackedHasuraEventHandler({
    tableName: 'default_table',
    triggerName: 'default_table_event_handler',
    definition: {
      type: 'insert',
    },
  })
  public defaultHandler() {
    console.log('default');
  }

  @TrackedHasuraEventHandler({
    databaseName: 'additional',
    tableName: 'additional_table',
    triggerName: 'additional_table_event_handler',
    definition: {
      type: 'delete',
    },
  })
  public additionalHandler() {
    console.log('additional');
  }

  @TrackedHasuraScheduledEventHandler({
    cronSchedule: CommonCronSchedules.EveryMinute,
    name: 'scheduled',
    payload: { message: 'hello' },
  })
  public scheduled() {
    console.log('scheduled');
  }
}
