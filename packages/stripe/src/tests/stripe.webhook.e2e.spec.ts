import { ConsoleLogger, INestApplication, Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { StripeWebhookHandler } from '../stripe.decorators';
import { StripeModuleConfig } from '../stripe.interfaces';
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
          ? StripeModule.forRoot(StripeModule, moduleConfig)
          : StripeModule.forRootAsync(StripeModule, {
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
      await app.init();

      const stripePayloadService =
        app.get<StripePayloadService>(StripePayloadService);

      hydratePayloadFn = jest
        .spyOn(stripePayloadService, 'tryHydratePayload')
        .mockImplementationOnce((sig, buff) => buff as any);
    });

    it('returns an error if the stripe signature is missing', () => {
      return request(app.getHttpServer())
        .post(stripeWebhookEndpoint)
        .send(expectedEvent)
        .expect(500);
    });

    it('routes incoming events to their handlers based on event type', () => {
      return request(app.getHttpServer())
        .post(stripeWebhookEndpoint)
        .send(expectedEvent)
        .set('stripe-signature', stripeSig)
        .expect(201)
        .then(() => {
          expect(testReceiveStripeFn).toHaveBeenCalledTimes(1);
          expect(hydratePayloadFn).toHaveBeenCalledTimes(1);
          expect(hydratePayloadFn).toHaveBeenCalledWith(
            stripeSig,
            expectedEvent
          );
          expect(testReceiveStripeFn).toHaveBeenCalledWith(expectedEvent);
        });
    });

    afterEach(() => jest.resetAllMocks());
  }
);
