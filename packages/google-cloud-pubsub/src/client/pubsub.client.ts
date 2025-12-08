import { Message, PubSub } from '@google-cloud/pubsub';
import { MessageOptions } from '@google-cloud/pubsub/build/src/topic';

import {
  PubsubConfigurationInvalidError,
  PubsubConfigurationMismatchError,
} from './pubsub-configuration.errors';
import { PubsubSchemaClient } from './pubsub-schema.client';
import { PubsubSubscriptionContainer } from './pubsub-subscription.container';
import { PubsubTopicContainer } from './pubsub-topic.container';
import {
  GoogleCloudPubsubMessage,
  PubsubClientConfiguration,
  PubsubClientLogger,
  PubsubSubscriptionConfiguration,
  PubsubTopicConfiguration,
} from './pubsub.client-types';
import { PubsubSerializer } from './pubsub.serializer';
import { PubsubSubscriptionBatchManager } from './pubsub-subscription.batch-manager';
import { promiseWithResolvers } from './utils';

export class PubsubClient {
  private readonly pubsub: PubSub;
  private readonly pubsubSchemaClient: PubsubSchemaClient;

  private readonly logger: PubsubClientLogger;

  private readonly topicContainers = new Map<string, PubsubTopicContainer>();
  private readonly subscriptionContainers = new Map<
    string,
    PubsubSubscriptionContainer
  >();

  private readonly attachedHandlers = new Set<string>();

  private readonly outstandingMessageProcessing = new Set<Promise<void>>();

  constructor(configuration: PubsubClientConfiguration) {
    const { logger, ...restConfiguration } = configuration;

    this.pubsub = new PubSub(restConfiguration);
    this.pubsubSchemaClient = new PubsubSchemaClient(this.pubsub);

    this.logger = logger || console;
  }

  public async initialize(
    topicConfigurations: readonly PubsubTopicConfiguration[],
  ): Promise<void> {
    for (const topicConfiguration of topicConfigurations) {
      const topicContainer =
        await this.connectAndValidateTopic(topicConfiguration);

      for (const subscriptionConfiguration of topicConfiguration.subscriptions) {
        await this.connectAndValidateSubscription(
          topicContainer,
          subscriptionConfiguration,
        );
      }

      const subscriptionNames = topicConfiguration.subscriptions.map(
        (subscription) => subscription.name,
      );

      this.logger.log(
        `Topic ${topicConfiguration.name} -> [${subscriptionNames.join(', ')}] initialized.`,
      );
    }

    this.logger.log(
      `Initialized. Topics=${this.topicContainers.size}, Subscriptions=${this.subscriptionContainers.size}.`,
    );
  }

  public async close(): Promise<void> {
    this.logger.log('Closing.');

    for (const container of this.subscriptionContainers.values()) {
      container.instance.removeAllListeners('message');
      container.instance.removeAllListeners('error');

      if (container.batchManager) {
        container.batchManager.flush();
      }
    }

    const closingSubscriptions = Array.from(
      this.subscriptionContainers.values(),
    ).map((subscription) =>
      subscription.instance.close().catch((e) => {
        this.logger.error(
          `Failed to close subscription (${subscription.configuration.name}): ${e.message}.`,
        );
      }),
    );

    await Promise.allSettled(closingSubscriptions);

    if (this.outstandingMessageProcessing.size > 0) {
      this.logger.log(
        `Waiting for ${this.outstandingMessageProcessing.size} subscriber(s) to finish.`,
      );

      await Promise.allSettled(this.outstandingMessageProcessing);
    }

    await this.pubsub.close().catch((e) => {
      this.logger.error(`Failed to close client: ${e.message}`);
    });

    this.logger.log('Closed.');
  }

  public async publish(
    topicName: string,
    message: Omit<MessageOptions, 'data'> & { data: unknown },
  ) {
    const topicContainer = this.topicContainers.get(topicName);

    if (!topicContainer) {
      throw new Error(
        `Topic (${topicName}) not initialized. Ensure it is defined in the configuration.`,
      );
    }

    const data = topicContainer.serializer.serialize(message.data);

    return topicContainer.instance.publishMessage({ ...message, data });
  }

  public async attachHandler(
    subscriptionName: string,
    handler: (message: GoogleCloudPubsubMessage) => Promise<void>,
  ) {
    if (this.attachedHandlers.has(subscriptionName)) {
      throw new Error(
        `Handler attachment failed. A handler has already been attached for subscription (${subscriptionName}).`,
      );
    }

    const subscriptionContainer =
      this.subscriptionContainers.get(subscriptionName);

    if (!subscriptionContainer) {
      throw new Error(`Subscription (${subscriptionName}) is not registered.`);
    }

    const subscription = subscriptionContainer.instance;
    const serializer = subscriptionContainer.topicContainer.serializer;

    const messageHandler = (message: Message) => {
      const { promise, resolve } = promiseWithResolvers();

      this.outstandingMessageProcessing.add(promise);

      promise.finally(() => {
        this.outstandingMessageProcessing.delete(promise);
      });

      const task = async () => {
        try {
          const deserializedMessage = this.deserializeMessage(
            message,
            serializer,
          );

          await handler(deserializedMessage);

          message.ack();
        } catch (error: any) {
          this.logger.error(
            `Failed to process message with id(${message.id}) on subscription (${subscription.name}). Error: ${error.message}`,
          );

          message.nack();
        }
      };

      task().finally(resolve);
    };

    const errorHandler = (error: Error) => {
      this.logger.error(
        `Subscription (${subscriptionName}) stream error: ${error.message}.`,
      );
    };

    subscription.on('message', messageHandler);
    subscription.on('error', errorHandler);

    this.attachedHandlers.add(subscription.name);

    this.logger.log(`Handler attached to ${subscriptionName}.`);
  }

  public async attachBatchHandler(
    subscriptionName: string,
    handler: (messages: GoogleCloudPubsubMessage[]) => Promise<void>,
  ) {
    if (this.attachedHandlers.has(subscriptionName)) {
      throw new Error(
        `Handler attachment failed. A handler has already been attached for subscription (${subscriptionName}).`,
      );
    }

    const subscriptionContainer =
      this.subscriptionContainers.get(subscriptionName);

    if (!subscriptionContainer) {
      throw new Error(`Subscription (${subscriptionName}) is not registered.`);
    }

    const subscription = subscriptionContainer.instance;
    const subscriptionOptions =
      subscriptionContainer.configuration.options || {};
    const serializer = subscriptionContainer.topicContainer.serializer;

    const batchManager = new PubsubSubscriptionBatchManager({
      maxMessages: subscriptionOptions.flowControl?.maxMessages ?? 1000,
      maxWaitTimeMilliseconds: 20,
    });

    subscriptionContainer.batchManager = batchManager;

    batchManager.on(async (batch) => {
      try {
        const deserializedMessages = batch.map((item) =>
          this.deserializeMessage(item.message, serializer),
        );

        await handler(deserializedMessages);

        batch.forEach((item) => {
          item.message.ack();
          item.deferred.resolve();
        });
      } catch (error: any) {
        this.logger.error(
          `Failed to process batch messages on subscription (${subscription.name}). Error: ${error.message}`,
        );

        batch.forEach((item) => {
          item.message.nack();
          item.deferred.resolve();
        });
      }
    });

    const messageHandler = (message: Message) => {
      const deferred = promiseWithResolvers();

      this.outstandingMessageProcessing.add(deferred.promise);

      deferred.promise.finally(() => {
        this.outstandingMessageProcessing.delete(deferred.promise);
      });

      batchManager.add({ message, deferred });
    };

    const errorHandler = (error: Error) => {
      this.logger.error(
        `Subscription (${subscriptionName}) stream error: ${error.message}.`,
      );
    };

    subscription.on('message', messageHandler);
    subscription.on('error', errorHandler);

    this.attachedHandlers.add(subscription.name);
    this.logger.log(`Handler attached to ${subscriptionName}.`);
  }

  private deserializeMessage(
    message: Message,
    serializer: PubsubSerializer,
  ): GoogleCloudPubsubMessage {
    return {
      attributes: message.attributes,
      data: serializer.deserialize(message),
      deliveryAttempt: message.deliveryAttempt,
      id: message.id,
      orderingKey: message.orderingKey,
      publishTime: message.publishTime,
    };
  }

  private async connectAndValidateTopic(
    configuration: PubsubTopicConfiguration,
  ) {
    const { name, publishOptions, schema } = configuration;

    if (this.topicContainers.has(name)) {
      throw new PubsubConfigurationInvalidError(name, {
        key: 'name',
        reason: 'Duplicate topic name.',
        value: name,
      });
    }

    const topic = this.pubsub.topic(name, publishOptions);
    const [exists] = await topic.exists();

    if (!exists) {
      throw new PubsubConfigurationMismatchError(name, {
        key: 'name',
        local: name,
        remote: null,
      });
    }

    const topicContainer = new PubsubTopicContainer(
      topic,
      new PubsubSerializer(name, schema),
      configuration,
    );

    await this.pubsubSchemaClient.connectAndValidateSchema(topicContainer);

    this.topicContainers.set(name, topicContainer);

    return topicContainer;
  }

  private async connectAndValidateSubscription(
    topicContainer: PubsubTopicContainer,
    configuration: PubsubSubscriptionConfiguration,
  ) {
    const { name, options } = configuration;

    if (this.subscriptionContainers.has(name)) {
      throw new PubsubConfigurationInvalidError(
        topicContainer.configuration.name,
        {
          key: 'subscription.name',
          reason: 'Duplicate subscription name.',
          value: name,
        },
      );
    }

    const subscription = topicContainer.instance.subscription(name, options);

    try {
      const [metadata] = await subscription.getMetadata();
      const remoteTopicName = metadata.topic?.split('/').pop();

      if (topicContainer.configuration.name !== remoteTopicName) {
        throw new PubsubConfigurationMismatchError(
          topicContainer.configuration.name,
          {
            key: 'subscription.topic.name',
            local: topicContainer.configuration.name,
            remote: remoteTopicName,
          },
        );
      }
    } catch (error) {
      if ((error as { code: number }).code === 5) {
        throw new PubsubConfigurationMismatchError(
          topicContainer.configuration.name,
          {
            key: 'subscription.name',
            local: name,
            remote: null,
          },
        );
      }

      throw error;
    }

    const subscriptionContainer = new PubsubSubscriptionContainer(
      subscription,
      configuration,
      topicContainer,
    );

    this.subscriptionContainers.set(name, subscriptionContainer);
  }
}
