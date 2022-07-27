import {
  Controller,
  MiddlewareConsumer,
  Module,
  NestModule,
  Post,
  Request,
  RequestMethod,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { WebhooksModule } from '../webhooks.module';
import { applyConfigurableRawBodyWebhookMiddleware } from '../webhooks.utilities';

const testBodyFn = jest.fn();

const expectedBody = { message: 'hello' };
const expectedRawBody = Buffer.from(JSON.stringify(expectedBody));
const rawBodyPropertyName = 'b0dy';

@Controller('webhook')
class WebhookController {
  @Post()
  webhook(@Request() request) {
    testBodyFn(request[rawBodyPropertyName]);
  }
}

@Controller('api')
class ApiController {
  @Post()
  body(@Request() request) {
    testBodyFn(request.body);
  }
}

@Module({
  imports: [
    WebhooksModule.forRoot(WebhooksModule, {
      requestRawBodyProperty: rawBodyPropertyName,
    }),
  ],
  controllers: [WebhookController, ApiController],
})
class TestAppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    applyConfigurableRawBodyWebhookMiddleware(consumer, [
      {
        method: RequestMethod.ALL,
        path: 'webhook',
      },
    ]);
  }
}

describe('Webhooks Configurable Raw Body Module (e2e)', () => {
  let app;
  describe('configurable webhook middleware', () => {
    beforeEach(async () => {
      testBodyFn.mockReset();
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [TestAppModule],
      }).compile();

      app = moduleFixture.createNestApplication({
        bodyParser: false,
      });
      await app.init();
    });

    it('should make the raw body available on the correct request property', () => {
      return request(app.getHttpServer())
        .post('/webhook')
        .send(expectedBody)
        .expect(201)
        .then(() => {
          expect(testBodyFn).toHaveBeenCalledTimes(1);
          expect(testBodyFn).toHaveBeenCalledWith(expectedRawBody);
        });
    });

    it('should use body parser json on all other routes', () => {
      return request(app.getHttpServer())
        .post('/api')
        .send(expectedBody)
        .expect(201)
        .then(() => {
          expect(testBodyFn).toHaveBeenCalledTimes(1);
          expect(testBodyFn).toHaveBeenCalledWith(expectedBody);
        });
    });
  });
});
