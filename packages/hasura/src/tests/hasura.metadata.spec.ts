import { Test, TestingModule } from '@nestjs/testing';
import { HasuraModule } from '../hasura.module';
import * as path from 'path';
import { INestApplication } from '@nestjs/common';
import * as fs from 'fs';
import {
  copyCleanTemplateYamlFile,
  getVersionedMetadataPathAndConfig,
  TestEventHandlerService,
  yamlFileToJson,
} from './hasura.metadata.spec-utils';
import { load } from 'js-yaml';

describe('Hasura Metadata', () => {
  describe.each([['v2'], ['v3']])('cron triggers %s', (v) => {
    let app: INestApplication;

    const [metadataPath, moduleConfig] = getVersionedMetadataPathAndConfig(v);

    const cronTriggersYamlPath = `${metadataPath}/cron_triggers.yaml`;

    beforeAll(async () => {
      copyCleanTemplateYamlFile(cronTriggersYamlPath);

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
      const tablesFilePath = path.join(metadataPath, 'tables.yaml');
      const expectedFilePath = path.join(metadataPath, 'tables.yaml.expected');
      describe('event handlers', () => {
        test('generates the correct metadata', async () => {
          const tablesFileContents = fs.readFileSync(tablesFilePath, 'utf-8');
          const expectedFileContents = fs.readFileSync(
            expectedFilePath,
            'utf-8'
          );
          expect(tablesFileContents).toEqual(expectedFileContents);
        });
      });
    });
  });

  describe('v3 metadata', () => {
    let app: INestApplication;

    const [metadataPath, moduleConfig] = getVersionedMetadataPathAndConfig(
      'v3'
    );

    beforeAll(async () => {
      // Ensure that the filesystem is clean so that we can ensure proper metadata comparison
      const tables = ['default', 'additional'];
      tables.forEach((x) => {
        const destinationPath = path.join(
          metadataPath,
          `databases/${x}/tables/public_${x}_table.yaml`
        );

        copyCleanTemplateYamlFile(destinationPath);
      });

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

            const actual = fs.readFileSync(tablePath, 'utf-8');
            const expected = fs.readFileSync(`${tablePath}.expected`, 'utf-8');

            expect(load(actual)).toEqual(load(expected));
          }
        );
      });
    });
  });
});
