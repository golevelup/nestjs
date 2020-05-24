import { Injectable, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { HasuraEventHandler } from '../hasura.decorators';
import { HasuraModule } from '../hasura.module';
import { HasuraModuleConfig } from '../hasura.interfaces';

const tableBoundEventHandler = jest.fn();
const triggerBoundEventHandler = jest.fn();
const triggerName = 'user_created';
const defaultHasuraEndpoint = '/hasura/events';

@Injectable()
class UserEventService {
  @HasuraEventHandler({
    table: { name: 'user' },
  })
  handleUserTableEvent(evt) {
    tableBoundEventHandler(evt);
  }

  @HasuraEventHandler({
    triggerName,
  })
  handleUserCreatedTrigger(evt) {
    triggerBoundEventHandler(evt);
  }
}

const secretHeader = 'api-secret-header';
const secret = 'secret';

const eventPayload = {
  id: 'ecd5fe4a-7113-4243-bb0e-6177c78a0033',
  table: { schema: 'public', name: 'user' },
  trigger: { name: triggerName },
  event: {
    session_variables: { 'x-hasura-role': 'admin' },
    op: 'INSERT',
    data: { old: null, new: [{}] },
  },
  delivery_info: { current_retry: 0, max_retries: 0 },
  created_at: '2020-02-20T01:12:12.789983Z',
};

const eventPayloadMissingTableAndTrigger = {
  ...eventPayload,
  table: { schema: 'public', name: 'userz' },
  trigger: { name: 'unbound_trigger' },
};

type ModuleType = 'forRoot' | 'forRootAsync';
const cases: [ModuleType, string | undefined][] = [
  ['forRoot', undefined],
  ['forRoot', 'customEndpoint'],
  ['forRootAsync', undefined],
  ['forRootAsync', 'customEndpoint'],
];

describe.each(cases)(
  'Hasura Module %p with controller prefix %p (e2e)',
  (moduleType, controllerPrefix) => {
    let app: INestApplication;
    const hasuraEndpoint = controllerPrefix
      ? `/${controllerPrefix}/events`
      : defaultHasuraEndpoint;

    const moduleConfig: HasuraModuleConfig = {
      secretFactory: secret,
      secretHeader: secretHeader,
      controllerPrefix,
      enableEventLogs: true,
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
        providers: [UserEventService],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    afterEach(() => {
      tableBoundEventHandler.mockReset();
      triggerBoundEventHandler.mockReset();
    });

    it('should return forbidden if the secret api header is missing', () => {
      return request(app.getHttpServer())
        .post(hasuraEndpoint)
        .send(eventPayload)
        .expect(403);
    });

    it('should return forbidden if the secret api header value does not match', () => {
      return request(app.getHttpServer())
        .post(hasuraEndpoint)
        .set(secretHeader, 'wrong Value')
        .send(eventPayload)
        .expect(403);
    });

    it('should return bad request if there is no event handler for the event', () => {
      return request(app.getHttpServer())
        .post(hasuraEndpoint)
        .set(secretHeader, secret)
        .send(eventPayloadMissingTableAndTrigger)
        .expect(400);
    });

    it('should pass the event to the correct handler', async () => {
      const response = await request(app.getHttpServer())
        .post(hasuraEndpoint)
        .set(secretHeader, secret)
        .send(eventPayload);

      expect(response.status).toEqual(202);
      expect(tableBoundEventHandler).toHaveBeenCalledTimes(1);
      expect(tableBoundEventHandler).toHaveBeenCalledWith(eventPayload);
      expect(triggerBoundEventHandler).toHaveBeenCalledTimes(1);
      expect(triggerBoundEventHandler).toHaveBeenCalledWith(eventPayload);
    });
  }
);
