import { INestApplication, Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { StripeWebhookHandler } from '../stripe.decorators';
import { StripeModuleConfig } from '../stripe.interfaces';
import { StripePayloadService } from '../stripe.payload.service';
import { StripeModule } from './../stripe.module';

const testReceiveStripeFn = jest.fn();
const defaultStripeWebhookEndpoint = '/stripe/webhook';
const eventType = 'payment_intent.created';
const expectedEvent = { type: eventType };
const stripeSig = 'stripeSignatureValue';

@Injectable()
class PaymentCreatedService {
  @StripeWebhookHandler(eventType)
  handlePaymentIntentCreated(evt: any) {
    testReceiveStripeFn(evt);
  }
}

const baseScenario: StripeModuleConfig['webhookConfig'] = {
  stripeWebhookSecret: '123',
  loggingConfiguration: {
    logMatchingEventHandlers: true,
  },
};

const scenarios: StripeModuleConfig['webhookConfig'][] = [
  baseScenario,
  { ...baseScenario, controllerPrefix: 'stripez' },
];

describe.each(scenarios)('Stripe Module (e2e)', (scenario) => {
  let app: INestApplication;
  let hydratePayloadFn: jest.Mock<
    {
      type: string;
    },
    [string, Buffer]
  >;

  const stripeWebhookEndpoint = scenario?.controllerPrefix
    ? `/${scenario?.controllerPrefix}/webhook`
    : defaultStripeWebhookEndpoint;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        StripeModule.forRoot(StripeModule, {
          apiKey: '123',
          webhookConfig: scenario,
        }),
      ],
      providers: [PaymentCreatedService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const stripePayloadService = app.get<StripePayloadService>(
      StripePayloadService
    );

    hydratePayloadFn = jest
      .spyOn(stripePayloadService, 'tryHydratePayload')
      .mockImplementationOnce((sig, buff) => buff as any);
  });

  afterEach(() => jest.resetAllMocks());

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
        expect(hydratePayloadFn).toHaveBeenCalledWith(stripeSig, expectedEvent);
        expect(testReceiveStripeFn).toHaveBeenCalledWith(expectedEvent);
      });
  });
});
