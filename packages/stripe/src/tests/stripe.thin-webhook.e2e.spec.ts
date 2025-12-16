import { ConsoleLogger, INestApplication, Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import {
  StripeWebhookHandler,
  StripeThinWebhookHandler,
} from '../stripe.decorators';
import { StripeModuleConfig, StripeWebhookMode } from '../stripe.interfaces';
import { StripePayloadService } from '../stripe.payload.service';
import { StripeModule } from '../stripe.module';

const testReceiveStripeFn = jest.fn();
const testReceiveThinStripeFn = jest.fn();
const testReceiveWildcardFn = jest.fn();
const testReceiveThinWildcardFn = jest.fn();
const defaultStripeWebhookEndpoint = '/stripe/webhook';
const eventType = 'payment_intent.created';
const thinEventType = 'v1.billing.meter.error_report_triggered';
const expectedEvent = { type: eventType };
const expectedThinEvent = { type: thinEventType };
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
class BillingMeterService {
  @StripeThinWebhookHandler(thinEventType)
  handleBillingMeterError(evt: any) {
    testReceiveThinStripeFn(evt);
  }
}

@Injectable()
class WildcardSnapshotService {
  @StripeWebhookHandler('*')
  handleAllSnapshotEvents(evt: any) {
    testReceiveWildcardFn(evt);
  }
}

@Injectable()
class WildcardThinService {
  @StripeThinWebhookHandler('*')
  handleAllThinEvents(evt: any) {
    testReceiveThinWildcardFn(evt);
  }
}

// Tests for thin webhook functionality
describe('Stripe Thin Webhooks (e2e)', () => {
  let app: INestApplication;
  let hydratePayloadFn: jest.SpyInstance;

  const moduleConfig: StripeModuleConfig = {
    apiKey: '123',
    webhookConfig: {
      stripeSecrets: {
        account: '123',
      },
      stripeThinSecrets: {
        account: 'thin-secret-123',
      },
      loggingConfiguration: {
        logMatchingEventHandlers: true,
      },
    },
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [StripeModule.forRoot(moduleConfig)],
      providers: [BillingMeterService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(new SilentLogger());
    await app.init();

    const stripePayloadService =
      app.get<StripePayloadService>(StripePayloadService);

    hydratePayloadFn = jest
      .spyOn(stripePayloadService, 'tryHydratePayload')
      .mockImplementation((sig, buff) => buff as any);
  });

  it('routes thin events to their handlers when mode=thin', () => {
    return request(app.getHttpServer())
      .post(`${defaultStripeWebhookEndpoint}?mode=${StripeWebhookMode.THIN}`)
      .send(expectedThinEvent)
      .set('stripe-signature', stripeSig)
      .expect(201)
      .then(() => {
        expect(testReceiveThinStripeFn).toHaveBeenCalledTimes(1);
        expect(hydratePayloadFn).toHaveBeenCalledTimes(1);
        expect(hydratePayloadFn).toHaveBeenCalledWith(
          stripeSig,
          expectedThinEvent,
          StripeWebhookMode.THIN,
        );
        expect(testReceiveThinStripeFn).toHaveBeenCalledWith(expectedThinEvent);
      });
  });

  it('returns error for invalid mode parameter', () => {
    return request(app.getHttpServer())
      .post(`${defaultStripeWebhookEndpoint}?mode=invalid`)
      .send(expectedEvent)
      .set('stripe-signature', stripeSig)
      .expect(500);
  });

  it('defaults to snapshot mode when mode parameter is missing', () => {
    return request(app.getHttpServer())
      .post(defaultStripeWebhookEndpoint)
      .send(expectedEvent)
      .set('stripe-signature', stripeSig)
      .expect(201)
      .then(() => {
        expect(hydratePayloadFn).toHaveBeenCalledWith(
          stripeSig,
          expectedEvent,
          StripeWebhookMode.SNAPSHOT,
        );
      });
  });

  afterEach(() => jest.resetAllMocks());
});

// Tests for mixed snapshot and thin handlers
describe('Stripe Mixed Snapshot and Thin Webhooks (e2e)', () => {
  let app: INestApplication;

  const moduleConfig: StripeModuleConfig = {
    apiKey: '123',
    webhookConfig: {
      stripeSecrets: {
        account: '123',
      },
      stripeThinSecrets: {
        account: 'thin-secret-123',
      },
      loggingConfiguration: {
        logMatchingEventHandlers: true,
      },
    },
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [StripeModule.forRoot(moduleConfig)],
      providers: [PaymentCreatedService, BillingMeterService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(new SilentLogger());
    await app.init();

    const stripePayloadService =
      app.get<StripePayloadService>(StripePayloadService);

    jest
      .spyOn(stripePayloadService, 'tryHydratePayload')
      .mockImplementation((sig, buff) => buff as any);
  });

  it('routes snapshot events to snapshot handlers', () => {
    return request(app.getHttpServer())
      .post(defaultStripeWebhookEndpoint)
      .send(expectedEvent)
      .set('stripe-signature', stripeSig)
      .expect(201)
      .then(() => {
        expect(testReceiveStripeFn).toHaveBeenCalledTimes(1);
        expect(testReceiveThinStripeFn).toHaveBeenCalledTimes(0);
      });
  });

  it('routes thin events to thin handlers', () => {
    return request(app.getHttpServer())
      .post(`${defaultStripeWebhookEndpoint}?mode=${StripeWebhookMode.THIN}`)
      .send(expectedThinEvent)
      .set('stripe-signature', stripeSig)
      .expect(201)
      .then(() => {
        expect(testReceiveThinStripeFn).toHaveBeenCalledTimes(1);
        expect(testReceiveStripeFn).toHaveBeenCalledTimes(0);
      });
  });

  afterEach(() => jest.resetAllMocks());
});

// Tests for wildcard handlers
describe('Stripe Wildcard Handlers (e2e)', () => {
  let app: INestApplication;

  const moduleConfig: StripeModuleConfig = {
    apiKey: '123',
    webhookConfig: {
      stripeSecrets: {
        account: '123',
      },
      stripeThinSecrets: {
        account: 'thin-secret-123',
      },
    },
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [StripeModule.forRoot(moduleConfig)],
      providers: [WildcardSnapshotService, WildcardThinService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(new SilentLogger());
    await app.init();

    const stripePayloadService =
      app.get<StripePayloadService>(StripePayloadService);

    jest
      .spyOn(stripePayloadService, 'tryHydratePayload')
      .mockImplementation((sig, buff) => buff as any);
  });

  it('wildcard snapshot handler receives all snapshot events', () => {
    return request(app.getHttpServer())
      .post(defaultStripeWebhookEndpoint)
      .send(expectedEvent)
      .set('stripe-signature', stripeSig)
      .expect(201)
      .then(() => {
        expect(testReceiveWildcardFn).toHaveBeenCalledTimes(1);
        expect(testReceiveWildcardFn).toHaveBeenCalledWith(expectedEvent);
      });
  });

  it('wildcard thin handler receives all thin events', () => {
    return request(app.getHttpServer())
      .post(`${defaultStripeWebhookEndpoint}?mode=${StripeWebhookMode.THIN}`)
      .send(expectedThinEvent)
      .set('stripe-signature', stripeSig)
      .expect(201)
      .then(() => {
        expect(testReceiveThinWildcardFn).toHaveBeenCalledTimes(1);
        expect(testReceiveThinWildcardFn).toHaveBeenCalledWith(
          expectedThinEvent,
        );
      });
  });

  it('wildcard handlers do not cross between modes', () => {
    return request(app.getHttpServer())
      .post(defaultStripeWebhookEndpoint)
      .send(expectedEvent)
      .set('stripe-signature', stripeSig)
      .expect(201)
      .then(() => {
        expect(testReceiveWildcardFn).toHaveBeenCalledTimes(1);
        expect(testReceiveThinWildcardFn).toHaveBeenCalledTimes(0);
      });
  });

  afterEach(() => jest.resetAllMocks());
});
