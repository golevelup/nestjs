import { INestApplication, Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import Stripe from 'stripe';
import { InjectStripeClient } from '../stripe.decorators';
import { StripeModule } from './../stripe.module';

const testReceiveStripeFn = jest.fn();

@Injectable()
class TestService {
  constructor(@InjectStripeClient() private readonly stripeClient: Stripe) {
    testReceiveStripeFn(stripeClient);
  }
}

describe('Stripe Module', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        StripeModule.forRoot(StripeModule, {
          apiKey: '123',
        }),
      ],
      providers: [TestService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('exposes a Stripe client', () => {
    expect(testReceiveStripeFn).toHaveBeenCalledTimes(1);

    const client = testReceiveStripeFn.mock.calls[0][0];
    expect(client).toBeInstanceOf(Stripe);
  });
});
