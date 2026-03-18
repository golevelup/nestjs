import {
  ArgumentsHost,
  Catch,
  ConsoleLogger,
  ExceptionFilter,
  HttpException,
  INestApplication,
  Injectable,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as pactum from 'pactum';
import { StripeWebhookHandler } from '../stripe.decorators';
import { StripeModuleConfig, StripeWebhookMode } from '../stripe.interfaces';
import { StripePayloadService } from '../stripe.payload.service';
import { StripeModule } from '../stripe.module';

const testReceiveStripeFn = jest.fn();
const defaultStripeWebhookEndpoint = '/stripe/webhook';
const eventType = 'payment_intent.created';
const expectedEvent = { type: eventType };
const stripeSig = 'stripeSignatureValue';

@Injectable()
class SilentLogger extends ConsoleLogger {
  constructor() {
    super();
  }
  error() {
    // ignore
  }
}

@Injectable()
class PaymentCreatedService {
  @StripeWebhookHandler(eventType)
  handlePaymentIntentCreated(evt: any) {
    testReceiveStripeFn(evt);
  }
}

@Injectable()
class ThrowingWebhookService {
  @StripeWebhookHandler(eventType)
  handlePaymentIntentCreated() {
    throw new Error('Handler error');
  }
}

/**
 * Mimics the behavior of Sentry's SentryGlobalFilter which extends NestJS's
 * BaseExceptionFilter. It accesses response.headersSent via switchToHttp(),
 * which caused a crash before the fix (the response was undefined in the
 * external exception filter context).
 */
@Catch()
class SentryLikeGlobalFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    // Accessing headersSent mirrors what Sentry's SentryGlobalFilter does and
    // is the exact line that threw "Cannot read properties of undefined
    // (reading 'headersSent')" before the fix.
    if (response && !response.headersSent) {
      const status =
        exception instanceof HttpException ? exception.getStatus() : 500;
      response.status(status).json({ message: 'Internal server error' });
    }
  }
}

type ModuleType = 'forRoot' | 'forRootAsync';
const cases: [ModuleType, string | undefined][] = [
  ['forRoot', undefined],
  ['forRoot', 'stripez'],
  ['forRootAsync', undefined],
  ['forRootAsync', 'stripez'],
];

describe.each(cases)(
  'Stripe Module %p with controller prefix %p (e2e)',
  (moduleType, controllerPrefix) => {
    let app: INestApplication;
    let hydratePayloadFn: jest.SpyInstance;

    const stripeWebhookEndpoint = controllerPrefix
      ? `/${controllerPrefix}/webhook`
      : defaultStripeWebhookEndpoint;

    const moduleConfig: StripeModuleConfig = {
      apiKey: '123',
      webhookConfig: {
        stripeSecrets: {
          account: '123',
        },
        loggingConfiguration: {
          logMatchingEventHandlers: true,
        },
        controllerPrefix,
      },
    };

    beforeEach(async () => {
      const moduleImport =
        moduleType === 'forRoot'
          ? StripeModule.forRoot(moduleConfig)
          : StripeModule.forRootAsync({
              useFactory: () => moduleConfig,
            });

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [moduleImport],
        providers: [PaymentCreatedService],
      }).compile();

      app = moduleFixture.createNestApplication();
      // For debugging purposes, It's safe to remove silent logger but this prevents polluting the console
      // with expected errors
      app.useLogger(new SilentLogger());
      await app.listen(0);
      pactum.request.setBaseUrl(await app.getUrl());

      const stripePayloadService =
        app.get<StripePayloadService>(StripePayloadService);

      hydratePayloadFn = jest
        .spyOn(stripePayloadService, 'tryHydratePayload')
        .mockResolvedValueOnce(expectedEvent as any);
    });

    it('returns an error if the stripe signature is missing', () => {
      return pactum
        .spec()
        .post(stripeWebhookEndpoint)
        .withJson(expectedEvent)
        .expectStatus(500);
    });

    it('routes incoming events to their handlers based on event type', async () => {
      await pactum
        .spec()
        .post(stripeWebhookEndpoint)
        .withJson(expectedEvent)
        .withHeaders({ 'stripe-signature': stripeSig })
        .expectStatus(201);
      expect(testReceiveStripeFn).toHaveBeenCalledTimes(1);
      expect(hydratePayloadFn).toHaveBeenCalledTimes(1);
      expect(hydratePayloadFn).toHaveBeenCalledWith(
        stripeSig,
        expectedEvent,
        StripeWebhookMode.SNAPSHOT,
      );
      expect(testReceiveStripeFn).toHaveBeenCalledWith(expectedEvent);
    });

    afterEach(async () => {
      jest.resetAllMocks();
      await app.close();
    });
  },
);

describe('Stripe Webhook error propagation', () => {
  let app: INestApplication;

  const moduleConfig: StripeModuleConfig = {
    apiKey: '123',
    webhookConfig: {
      stripeSecrets: {
        account: '123',
      },
    },
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [StripeModule.forRoot(moduleConfig)],
      providers: [ThrowingWebhookService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(new SilentLogger());
    // Register a global filter that mimics Sentry's SentryGlobalFilter:
    // it accesses response.headersSent via switchToHttp().getResponse().
    // Before the fix this threw "Cannot read properties of undefined
    // (reading 'headersSent')" because the external context had no HTTP
    // response object.
    app.useGlobalFilters(new SentryLikeGlobalFilter());
    await app.listen(0);
    pactum.request.setBaseUrl(await app.getUrl());

    const stripePayloadService =
      app.get<StripePayloadService>(StripePayloadService);

    jest
      .spyOn(stripePayloadService, 'tryHydratePayload')
      .mockImplementationOnce((sig, buff) => buff as any);
  });

  it('returns 500 when a webhook handler throws, without crashing due to missing response context', () => {
    return pactum
      .spec()
      .post(defaultStripeWebhookEndpoint)
      .withJson(expectedEvent)
      .withHeaders({ 'stripe-signature': stripeSig })
      .expectStatus(500);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await app.close();
  });
});
