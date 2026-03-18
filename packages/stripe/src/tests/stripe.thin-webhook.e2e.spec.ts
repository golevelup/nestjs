import { ConsoleLogger, INestApplication, Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { request as pactumRequest, spec } from 'pactum';
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
    await app.listen(0);
    pactumRequest.setBaseUrl(await app.getUrl());

    const stripePayloadService =
      app.get<StripePayloadService>(StripePayloadService);

    hydratePayloadFn = jest
      .spyOn(stripePayloadService, 'tryHydratePayload')
      .mockResolvedValue(expectedThinEvent as any);
  });

  it('routes thin events to their handlers when mode=thin', async () => {
    await spec()
      .post(`${defaultStripeWebhookEndpoint}?mode=${StripeWebhookMode.THIN}`)
      .withJson(expectedThinEvent)
      .withHeaders({ 'stripe-signature': stripeSig })
      .expectStatus(201)
      .toss();

    expect(testReceiveThinStripeFn).toHaveBeenCalledTimes(1);
    expect(hydratePayloadFn).toHaveBeenCalledTimes(1);
    expect(hydratePayloadFn).toHaveBeenCalledWith(
      stripeSig,
      expectedThinEvent,
      StripeWebhookMode.THIN,
    );
    expect(testReceiveThinStripeFn).toHaveBeenCalledWith(expectedThinEvent);
  });

  it('returns error for invalid mode parameter', async () => {
    await spec()
      .post(`${defaultStripeWebhookEndpoint}?mode=invalid`)
      .withJson(expectedEvent)
      .withHeaders({ 'stripe-signature': stripeSig })
      .expectStatus(500)
      .toss();
  });

  it('defaults to snapshot mode when mode parameter is missing', async () => {
    await spec()
      .post(defaultStripeWebhookEndpoint)
      .withJson(expectedEvent)
      .withHeaders({ 'stripe-signature': stripeSig })
      .expectStatus(201)
      .toss();

    expect(hydratePayloadFn).toHaveBeenCalledWith(
      stripeSig,
      expectedEvent,
      StripeWebhookMode.SNAPSHOT,
    );
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await app.close();
  });
});

// Tests for mixed snapshot and thin handlers
describe('Stripe Mixed Snapshot and Thin Webhooks (e2e)', () => {
  let app: INestApplication;
  let stripePayloadService: StripePayloadService;

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
    await app.listen(0);
    pactumRequest.setBaseUrl(await app.getUrl());

    stripePayloadService = app.get<StripePayloadService>(StripePayloadService);
  });

  it('routes snapshot events to snapshot handlers', async () => {
    jest
      .spyOn(stripePayloadService, 'tryHydratePayload')
      .mockResolvedValue(expectedEvent as any);

    await spec()
      .post(defaultStripeWebhookEndpoint)
      .withJson(expectedEvent)
      .withHeaders({ 'stripe-signature': stripeSig })
      .expectStatus(201)
      .toss();

    expect(testReceiveStripeFn).toHaveBeenCalledTimes(1);
    expect(testReceiveThinStripeFn).toHaveBeenCalledTimes(0);
  });

  it('routes thin events to thin handlers', async () => {
    jest
      .spyOn(stripePayloadService, 'tryHydratePayload')
      .mockResolvedValue(expectedThinEvent as any);

    await spec()
      .post(`${defaultStripeWebhookEndpoint}?mode=${StripeWebhookMode.THIN}`)
      .withJson(expectedThinEvent)
      .withHeaders({ 'stripe-signature': stripeSig })
      .expectStatus(201)
      .toss();

    expect(testReceiveThinStripeFn).toHaveBeenCalledTimes(1);
    expect(testReceiveStripeFn).toHaveBeenCalledTimes(0);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await app.close();
  });
});

// Tests for wildcard handlers
describe('Stripe Wildcard Handlers (e2e)', () => {
  let app: INestApplication;
  let stripePayloadService: StripePayloadService;

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
    await app.listen(0);
    pactumRequest.setBaseUrl(await app.getUrl());

    stripePayloadService = app.get<StripePayloadService>(StripePayloadService);
  });

  it('wildcard snapshot handler receives all snapshot events', async () => {
    jest
      .spyOn(stripePayloadService, 'tryHydratePayload')
      .mockResolvedValue(expectedEvent as any);

    await spec()
      .post(defaultStripeWebhookEndpoint)
      .withJson(expectedEvent)
      .withHeaders({ 'stripe-signature': stripeSig })
      .expectStatus(201)
      .toss();

    expect(testReceiveWildcardFn).toHaveBeenCalledTimes(1);
    expect(testReceiveWildcardFn).toHaveBeenCalledWith(expectedEvent);
  });

  it('wildcard thin handler receives all thin events', async () => {
    jest
      .spyOn(stripePayloadService, 'tryHydratePayload')
      .mockResolvedValue(expectedThinEvent as any);

    await spec()
      .post(`${defaultStripeWebhookEndpoint}?mode=${StripeWebhookMode.THIN}`)
      .withJson(expectedThinEvent)
      .withHeaders({ 'stripe-signature': stripeSig })
      .expectStatus(201)
      .toss();

    expect(testReceiveThinWildcardFn).toHaveBeenCalledTimes(1);
    expect(testReceiveThinWildcardFn).toHaveBeenCalledWith(expectedThinEvent);
  });

  it('wildcard handlers do not cross between modes', async () => {
    jest
      .spyOn(stripePayloadService, 'tryHydratePayload')
      .mockResolvedValue(expectedEvent as any);

    await spec()
      .post(defaultStripeWebhookEndpoint)
      .withJson(expectedEvent)
      .withHeaders({ 'stripe-signature': stripeSig })
      .expectStatus(201)
      .toss();

    expect(testReceiveWildcardFn).toHaveBeenCalledTimes(1);
    expect(testReceiveThinWildcardFn).toHaveBeenCalledTimes(0);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await app.close();
  });
});
