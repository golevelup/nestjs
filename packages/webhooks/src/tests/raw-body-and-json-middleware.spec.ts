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
import { request as pactumRequest, spec } from 'pactum';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { applyRawBodyOnlyTo } from '../webhooks.utilities';

const testBodyFn = vi.fn();

const expectedBody = { message: 'hello' };
const expectedRawBody = Buffer.from(JSON.stringify(expectedBody));
@Controller('raw')
class WebhookController {
  @Post()
  webhook(@Request() request) {
    testBodyFn(request.body);
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
  controllers: [WebhookController, ApiController],
})
class TestAppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    applyRawBodyOnlyTo(consumer, {
      method: RequestMethod.ALL,
      path: 'raw',
    });
  }
}

describe('Webhooks Raw Body And JSON middleware', () => {
  let app;
  describe('only for certain endpoitns util', () => {
    beforeEach(async () => {
      testBodyFn.mockReset();
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [TestAppModule],
      }).compile();

      app = moduleFixture.createNestApplication({
        bodyParser: false,
      });
      await app.listen(0);
      pactumRequest.setBaseUrl(await app.getUrl());
    });

    afterEach(async () => {
      await app.close();
    });

    it('should make the raw body available on the correct request property', async () => {
      await spec().post('/raw').withJson(expectedBody).expectStatus(201).toss();

      expect(testBodyFn).toHaveBeenCalledTimes(1);
      expect(testBodyFn).toHaveBeenCalledWith(expectedRawBody);
    });

    it('should use body parser json on all other routes', async () => {
      await spec().post('/api').withJson(expectedBody).expectStatus(201).toss();

      expect(testBodyFn).toHaveBeenCalledTimes(1);
      expect(testBodyFn).toHaveBeenCalledWith(expectedBody);
    });
  });
});
