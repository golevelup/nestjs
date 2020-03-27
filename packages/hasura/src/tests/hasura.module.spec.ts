import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { HasuraEventHandler } from '../hasura.decorators';
import { HasuraModule } from '../hasura.module';

const eventHandlerFn = jest.fn();
const hasuraEndpoint = '/hasura/events';

@Injectable()
class UserEventService {
  @HasuraEventHandler({
    table: { name: 'user' },
  })
  handleUserCreated() {
    eventHandlerFn();
  }
}

const secretHeader = 'api-secret-header';
const secret = 'secret';

const eventPayload = {
  id: 'ecd5fe4a-7113-4243-bb0e-6177c78a0033',
  table: { schema: 'public', name: 'user' },
  trigger: { name: 'user_created' },
  event: {
    session_variables: { 'x-hasura-role': 'admin' },
    op: 'INSERT',
    data: { old: null, new: [{}] },
  },
  delivery_info: { current_retry: 0, max_retries: 0 },
  created_at: '2020-02-20T01:12:12.789983Z',
};

const eventPayloadMissingTable = {
  ...eventPayload,
  table: { schema: 'public', name: 'userz' },
};

describe('Hasura Module (e2e)', () => {
  let app;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        HasuraModule.forRoot(HasuraModule, {
          secretFactory: secret,
          secretHeader: secretHeader,
        }),
      ],
      providers: [UserEventService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
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
      .send(eventPayloadMissingTable)
      .expect(400);
  });

  it('should pass the event to the correct handler', () => {
    return request(app.getHttpServer())
      .post(hasuraEndpoint)
      .set(secretHeader, secret)
      .send(eventPayload)
      .expect(202)
      .then((x) => expect(eventHandlerFn).toHaveBeenCalledTimes(1));
  });
});
