import { Injectable, NestMiddleware } from '@nestjs/common';
import { json, raw } from 'body-parser';
import { Request, Response } from 'express';
import { InjectWebhookConfig } from './webhooks.decorators';
import { WebhooksModuleConfig } from './webhooks.interfaces';

// https://stackoverflow.com/questions/54346465/access-raw-body-of-stripe-webhook-in-nest-js

/**
 * Wraps the default json bodyParser behavior
 */
@Injectable()
export class JsonBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => any) {
    json()(req, res, next);
  }
}

/**
 * Wraps the default bodyParser raw behavior
 */
@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => any) {
    raw({ type: '*/*' })(req, res, next);
  }
}

/**
 * Copies the raw buffer from the request body onto a configurable request object property  (Defaults to 'rawBody')
 * Can be combined with regular JSON parsing to make both the raw and JSON body values consumable
 * This allows the raw body to be accessed in other middlewares or controllers
 */
@Injectable()
export class ConfigurableRawBodyMiddleware implements NestMiddleware {
  constructor(
    @InjectWebhookConfig() private readonly config: WebhooksModuleConfig
  ) {}

  use(req: Request, res: Response, next: () => any) {
    json({
      verify: (req: any, res, buffer, encoding) => {
        if (Buffer.isBuffer(buffer)) {
          const rawBody = Buffer.from(buffer);
          req[this.config.requestRawBodyProperty] = rawBody;
        }
        return true;
      },
    })(req, res, next);
  }
}
