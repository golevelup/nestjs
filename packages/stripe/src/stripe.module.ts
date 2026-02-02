import {
  DiscoveryModule,
  DiscoveryService,
  MetaKey,
} from '@golevelup/nestjs-discovery';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { flatten, groupBy, omit } from 'lodash';
import Stripe from 'stripe';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './stripe-module-definition';
import {
  STRIPE_CLIENT_TOKEN,
  STRIPE_WEBHOOK_CONTEXT_TYPE,
  STRIPE_WEBHOOK_HANDLER,
  STRIPE_WEBHOOK_SERVICE,
  STRIPE_THIN_WEBHOOK_HANDLER,
} from './stripe.constants';
import { InjectStripeModuleConfig } from './stripe.decorators';
import { StripeModuleConfig, StripeWebhookMode } from './stripe.interfaces';
import { StripePayloadService } from './stripe.payload.service';
import { StripeWebhookController } from './stripe.webhook.controller';
import { StripeWebhookService } from './stripe.webhook.service';

@Module({
  controllers: [StripeWebhookController],
  imports: [DiscoveryModule],
  providers: [
    {
      provide: Symbol('CONTROLLER_HACK'),
      inject: [MODULE_OPTIONS_TOKEN],
      useFactory: (config: StripeModuleConfig) => {
        const controllerPrefix =
          config.webhookConfig?.controllerPrefix || 'stripe';

        Reflect.defineMetadata(
          PATH_METADATA,
          controllerPrefix,
          StripeWebhookController,
        );
        config.webhookConfig?.decorators?.forEach((deco) => {
          deco(StripeWebhookController);
        });
      },
    },
    {
      provide: STRIPE_CLIENT_TOKEN,
      inject: [MODULE_OPTIONS_TOKEN],
      useFactory: ({
        apiKey,
        typescript = true,
        apiVersion = '2026-01-28.clover',
        ...options
      }: StripeModuleConfig): Stripe => {
        return new Stripe(apiKey, {
          typescript,
          apiVersion,
          ...omit(options, ['webhookConfig']),
        });
      },
    },
    StripeWebhookService,
    StripePayloadService,
  ],
  exports: [STRIPE_CLIENT_TOKEN],
})
export class StripeModule
  extends ConfigurableModuleClass
  implements OnModuleInit
{
  private readonly logger = new Logger(StripeModule.name);

  constructor(
    private readonly discover: DiscoveryService,
    private readonly externalContextCreator: ExternalContextCreator,
    @InjectStripeModuleConfig()
    private readonly stripeModuleConfig: StripeModuleConfig,
  ) {
    super();
  }

  private async discoverAndCreateWebhookHandlers(
    metadataKey: MetaKey,
    mode: StripeWebhookMode,
  ) {
    const eventHandlerMeta =
      await this.discover.providerMethodsWithMetaAtKey<string>(metadataKey);

    const grouped = groupBy(
      eventHandlerMeta,
      (x) => x.discoveredMethod.parentClass.name,
    );

    const webhookHandlers = flatten(
      Object.keys(grouped).map((x) => {
        this.logger.log(
          `Registering Stripe ${mode} webhook handlers from ${x}`,
        );

        return grouped[x].map(({ discoveredMethod, meta: eventType }) => ({
          key: eventType,
          handler: this.externalContextCreator.create(
            discoveredMethod.parentClass.instance,
            discoveredMethod.handler,
            discoveredMethod.methodName,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            STRIPE_WEBHOOK_CONTEXT_TYPE,
          ),
        }));
      }),
    );

    return { handlers: webhookHandlers, handlerMeta: eventHandlerMeta };
  }

  private async getStripeWebhookService() {
    const [stripeWebhookService] = (
      (await this.discover.providersWithMetaAtKey<boolean>(
        STRIPE_WEBHOOK_SERVICE,
      )) || []
    ).map((x) => x.discoveredClass.instance);

    if (
      !stripeWebhookService ||
      !(stripeWebhookService instanceof StripeWebhookService)
    ) {
      throw new Error('Could not find instance of Stripe Webhook Service');
    }

    return stripeWebhookService;
  }

  private validateWebhookSecrets(
    hasSnapshotHandlers: boolean,
    hasThinHandlers: boolean,
  ) {
    const noSnapshotSecretProvided =
      !this.stripeModuleConfig.webhookConfig?.stripeSecrets ||
      Object.values(this.stripeModuleConfig.webhookConfig.stripeSecrets).filter(
        Boolean,
      ).length === 0;

    const noThinSecretProvided =
      !this.stripeModuleConfig.webhookConfig?.stripeThinSecrets ||
      Object.values(
        this.stripeModuleConfig.webhookConfig.stripeThinSecrets,
      ).filter(Boolean).length === 0;

    // Validate snapshot secrets if snapshot handlers exist
    if (hasSnapshotHandlers && noSnapshotSecretProvided) {
      const errorMessage =
        'Snapshot webhook handlers found but no snapshot secrets provided. ' +
        'Please provide at least one of: stripeSecrets.account, stripeSecrets.accountTest, ' +
        'stripeSecrets.connect, or stripeSecrets.connectTest';

      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Validate thin secrets if thin handlers exist
    if (hasThinHandlers && noThinSecretProvided) {
      const errorMessage =
        'Thin webhook handlers found but no thin secrets provided. ' +
        'Please provide at least one of: stripeThinSecrets.account, stripeThinSecrets.accountTest, ' +
        'stripeThinSecrets.connect, or stripeThinSecrets.connectTest';

      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    // At least one type of handler must exist
    if (!hasSnapshotHandlers && !hasThinHandlers) {
      this.logger.warn(
        'No webhook handlers found. Stripe module initialized but will not handle any events.',
      );

      return false;
    }

    return true;
  }

  public async onModuleInit() {
    // If they didn't provide a webhook config secret there's no reason
    // to even attempt discovery
    if (!this.stripeModuleConfig.webhookConfig) {
      return;
    }

    this.logger.log('Initializing Stripe Module for webhooks');

    const stripeWebhookService = await this.getStripeWebhookService();

    // Discover and create snapshot webhook handlers
    const { handlers: webhookHandlers, handlerMeta: eventHandlerMeta } =
      await this.discoverAndCreateWebhookHandlers(
        STRIPE_WEBHOOK_HANDLER,
        StripeWebhookMode.SNAPSHOT,
      );

    // Discover and create thin webhook handlers
    const { handlers: thinWebhookHandlers, handlerMeta: thinEventHandlerMeta } =
      await this.discoverAndCreateWebhookHandlers(
        STRIPE_THIN_WEBHOOK_HANDLER,
        StripeWebhookMode.THIN,
      );

    // Check if handlers exist for each mode
    const hasThinHandlers = thinEventHandlerMeta.length > 0;
    const hasSnapshotHandlers = eventHandlerMeta.length > 0;

    // Validate webhook secrets
    const hasHandlers = this.validateWebhookSecrets(
      hasSnapshotHandlers,
      hasThinHandlers,
    );

    if (!hasHandlers) {
      return;
    }

    const handleWebhook = async (
      webhookEvent: { type: string },
      mode: StripeWebhookMode,
    ) => {
      const { type } = webhookEvent;

      // Select the correct handler list based on mode
      const handlers = (
        mode === StripeWebhookMode.THIN ? thinWebhookHandlers : webhookHandlers
      ).filter((x) => x.key === type || x.key === '*');

      if (handlers.length) {
        if (
          this.stripeModuleConfig?.webhookConfig?.loggingConfiguration
            ?.logMatchingEventHandlers
        ) {
          this.logger.log(
            `Received ${mode} webhook event for ${type}. Forwarding to ${handlers.length} event handlers`,
          );
        }
        await Promise.all(handlers.map((x) => x.handler(webhookEvent)));
      }
    };

    stripeWebhookService.handleWebhook = handleWebhook;
  }
}
