import { HasuraAction } from './../hasura.actions.interfaces';
import { Injectable, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { HasuraActionHandler } from '../hasura.decorators';
import { HasuraModule } from '../hasura.module';
import { HasuraModuleConfig } from '../hasura.events.interfaces';

const innerActionHandler = jest.fn();
const defaultHasuraEndpoint = '/hasura/actions';

const secretHeader = 'api-secret-header';
const secret = 'secret';
const actionName = 'test-action';

@Injectable()
class TestActionHandlerService {
  @HasuraActionHandler({
    actionName,
  })
  handleTestAction(actionInput) {
    innerActionHandler(actionInput);
  }
}

const actionPayload: HasuraAction = {
  action: {
    name: actionName,
  },
  session_variables: { 'x-hasura-role': 'admin' },
  input: {
    val: 42,
  },
};

const actionPayloadWithNoAssociatedHandler = {
  ...actionPayload,
  action: { name: 'no-handler' },
};

type ModuleType = 'forRoot' | 'forRootAsync';
const cases: [ModuleType, string | undefined][] = [
  ['forRoot', undefined],
  ['forRoot', 'customEndpoint'],
  ['forRootAsync', undefined],
  ['forRootAsync', 'customEndpoint'],
];

describe.each(cases)(
  'Hasura Action Event Handler %p with controller prefix %p (e2e)',
  (moduleType, controllerPrefix) => {
    let app: INestApplication;
    const hasuraEndpoint = controllerPrefix
      ? `/${controllerPrefix}/actions`
      : defaultHasuraEndpoint;

    const moduleConfig: HasuraModuleConfig = {
      secretFactory: secret,
      secretHeader: secretHeader,
      controllerPrefix,
      enableEventLogs: true,
      endpoint: '',
    };

    beforeEach(async () => {
      const moduleImport =
        moduleType === 'forRootAsync'
          ? HasuraModule.forRootAsync(HasuraModule, {
              useFactory: () => moduleConfig,
            })
          : HasuraModule.forRoot(HasuraModule, moduleConfig);

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [moduleImport],
        providers: [TestActionHandlerService],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    afterEach(() => {
      innerActionHandler.mockReset();
    });

    it('should return forbidden if the secret api header is missing', () => {
      return request(app.getHttpServer())
        .post(hasuraEndpoint)
        .send(actionPayload)
        .expect(403);
    });

    it('should return forbidden if the secret api header value does not match', () => {
      return request(app.getHttpServer())
        .post(hasuraEndpoint)
        .set(secretHeader, 'wrong Value')
        .send(actionPayload)
        .expect(403);
    });

    it('should return bad request if there is no action handler for the event', () => {
      return request(app.getHttpServer())
        .post(hasuraEndpoint)
        .set(secretHeader, secret)
        .send(actionPayloadWithNoAssociatedHandler)
        .expect(400);
    });

    it('should pass the action input to the correct handler', async () => {
      const response = await request(app.getHttpServer())
        .post(hasuraEndpoint)
        .set(secretHeader, secret)
        .send(actionPayload);

      expect(response.status).toEqual(200);
      expect(innerActionHandler).toHaveBeenCalledTimes(1);
      expect(innerActionHandler).toHaveBeenCalledWith(actionPayload.input);
    });
  }
);
