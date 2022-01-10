import { Test, TestingModule } from '@nestjs/testing';
import { HasuraModule } from '../hasura.module';
import * as path from 'path';
import { INestApplication } from '@nestjs/common';
import {
  copyCleanTemplateYamlFile,
  getVersionedMetadataPathAndConfig,
  TestEventHandlerService,
  yamlFileToJson,
} from './hasura.metadata.spec-utils';

const TABLES_YAML = 'tables.yaml';
const CRON_TRIGGERS_YAML = 'cron_triggers.yaml';

describe('Hasura Metadata', () => {
  beforeAll(() => {
    const [v2Path] = getVersionedMetadataPathAndConfig('v2');

    const [v3Path] = getVersionedMetadataPathAndConfig('v3');

    const tables = ['default', 'additional'];
    const tablePaths = tables.map((x) =>
      path.join(v3Path, `databases/${x}/tables/public_${x}_table.yaml`)
    );

    const testYamlFilePaths = [
      path.join(v2Path, TABLES_YAML),
      path.join(v2Path, CRON_TRIGGERS_YAML),
      path.join(v3Path, CRON_TRIGGERS_YAML),
      ...tablePaths,
    ];

    testYamlFilePaths.forEach((x) => {
      copyCleanTemplateYamlFile(x);
    });
  });

  describe.each([['v2'], ['v3']])('cron triggers %s', (v) => {
    let app: INestApplication;

    const [metadataPath, moduleConfig] = getVersionedMetadataPathAndConfig(v);

    const cronTriggersYamlPath = `${metadataPath}/${CRON_TRIGGERS_YAML}`;

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [HasuraModule.forRoot(HasuraModule, moduleConfig)],
        providers: [TestEventHandlerService],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    test('generates correct yaml file', async () => {
      expect(yamlFileToJson(cronTriggersYamlPath)).toEqual(
        yamlFileToJson(`${cronTriggersYamlPath}.expected`)
      );
    });
  });

  describe('v2 metadata', () => {
    const [metadataPath, moduleConfig] = getVersionedMetadataPathAndConfig(
      'v2'
    );

    const tablesFilePath = path.join(metadataPath, TABLES_YAML);
    const expectedFilePath = `${tablesFilePath}.expected`;

    let app: INestApplication;

    // eslint-disable-next-line sonarjs/no-identical-functions
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [HasuraModule.forRoot(HasuraModule, moduleConfig)],
        providers: [TestEventHandlerService],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    describe('tables', () => {
      describe('event handlers', () => {
        test('generates the correct metadata', async () => {
          expect(yamlFileToJson(tablesFilePath)).toEqual(
            yamlFileToJson(expectedFilePath)
          );
        });
      });
    });
  });

  describe('v3 metadata', () => {
    let app: INestApplication;

    const [metadataPath, moduleConfig] = getVersionedMetadataPathAndConfig(
      'v3'
    );

    // eslint-disable-next-line sonarjs/no-identical-functions
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [HasuraModule.forRoot(HasuraModule, moduleConfig)],
        providers: [TestEventHandlerService],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    describe('tables', () => {
      describe('event handlers', () => {
        it.each([['default'], ['additional']])(
          'manages event handler metadata: %s database',
          (d) => {
            const tablePath = path.join(
              metadataPath,
              `databases/${d}/tables/public_${d}_table.yaml`
            );

            expect(yamlFileToJson(tablePath)).toEqual(
              yamlFileToJson(`${tablePath}.expected`)
            );
          }
        );
      });
    });
  });
});
