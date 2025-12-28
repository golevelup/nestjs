import { Message, PubSub } from '@google-cloud/pubsub';
import { MessageOptions } from '@google-cloud/pubsub/build/src/topic';

import { PubsubConfigurationInvalidError, PubsubConfigurationMismatchError } from './pubsub-configuration.errors';
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

export class PubsubClient {
  private readonly pubsub: PubSub;
  private readonly pubsubSchemaClient: PubsubSchemaClient;

  private readonly logger: PubsubClientLogger;

  private readonly topicContainers = new Map<string, PubsubTopicContainer>();
  private readonly subscriptionContainers = new Map<string, PubsubSubscriptionContainer>();

  private readonly attachedHandlers = new Set<string>();

  private readonly outstandingMessageProcessing = new Set<Promise<void>>();

  constructor(configuration: PubsubClientConfiguration) {
    const { logger, ...restConfiguration } = configuration;

    this.pubsub = new PubSub(restConfiguration);
    this.pubsubSchemaClient = new PubsubSchemaClient(this.pubsub);

    this.logger = logger || console;
  }

  public async initialize(topicConfigurations: readonly PubsubTopicConfiguration[]) {
    const topicNames = new Set<string>();
    const subscriptionNames = new Set<string>();

    for (const topicConfiguration of topicConfigurations) {
      if (topicNames.has(topicConfiguration.name)) {
        throw new PubsubConfigurationInvalidError(topicConfiguration.name, {
          key: 'name',
          reason: 'Duplicate topic name in configuration.',
          value: topicConfiguration.name,
        });
      }

      topicNames.add(topicConfiguration.name);

      for (const subscriptionConfiguration of topicConfiguration.subscriptions) {
        if (subscriptionNames.has(subscriptionConfiguration.name)) {
          throw new PubsubConfigurationInvalidError(topicConfiguration.name, {
            key: 'subscription.name',
            reason: 'Duplicate subscription name in configuration.',
            value: subscriptionConfiguration.name,
          });
        }

        subscriptionNames.add(subscriptionConfiguration.name);
      }
    }

    await Promise.all(
      topicConfigurations.map(async (topicConfiguration) => {
        const topicContainer = await this.connectAndValidateTopic(topicConfiguration);

        await Promise.all(
          topicConfiguration.subscriptions.map(async (subscriptionConfiguration) =>
            this.connectAndValidateSubscription(topicContainer, subscriptionConfiguration),
          ),
        );
      }),
    );

    this.logger.log(`Initialized. Topics=${this.topicContainers.size}, Subscriptions=${this.subscriptionContainers.size}.`);
  }

  public async close(): Promise<void> {
    const flushPromises: Promise<void>[] = [];

    for (const container of this.subscriptionContainers.values()) {
      container.instance.removeAllListeners('message');
      container.instance.removeAllListeners('error');

      if (container.batchManager) {
        flushPromises.push(container.batchManager.flush());
      }
    }

    if (flushPromises.length > 0) {
      await Promise.allSettled(flushPromises);
    }

    const closingSubscriptions = Array.from(this.subscriptionContainers.values()).map((subscription) =>
      subscription.instance.close().catch((e) => {
        this.logger.error(`Failed to close subscription (${subscription.configuration.name}): ${e.message}.`);
      }),
    );

    await Promise.allSettled(closingSubscriptions);

    if (this.outstandingMessageProcessing.size > 0) {
      this.logger.log(`Waiting for ${this.outstandingMessageProcessing.size} subscriber(s) to finish.`);

      await Promise.allSettled(this.outstandingMessageProcessing);
    }

    await this.pubsub.close().catch((e) => {
      this.logger.error(`Failed to close client: ${e.message}`);
    });

    this.logger.log('Closed.');
  }

  public async publish(topicName: string, message: Omit<MessageOptions, 'data'> & { data: unknown }) {
    const topicContainer = this.topicContainers.get(topicName);

    if (!topicContainer) {
      throw new Error(`Topic (${topicName}) not initialized. Ensure it is defined in the configuration.`);
    }

    const data = topicContainer.serializer.serialize(message.data);

    return topicContainer.instance.publishMessage({ ...message, data });
  }

  public async attachHandler(subscriptionName: string, handler: (message: GoogleCloudPubsubMessage) => Promise<void>) {
    if (this.attachedHandlers.has(subscriptionName)) {
      throw new Error(`Handler attachment failed. A handler has already been attached for subscription (${subscriptionName}).`);
    }

    const subscriptionContainer = this.subscriptionContainers.get(subscriptionName);

    if (!subscriptionContainer) {
      throw new Error(`Subscription (${subscriptionName}) is not registered.`);
    }

    const subscription = subscriptionContainer.instance;
    const serializer = subscriptionContainer.topicContainer.serializer;

    const messageHandler = (message: Message) => {
      const task = async () => {
        try {
          const deserializedMessage = this.deserializeMessage(message, serializer);

          await handler(deserializedMessage);

          message.ack();
        } catch (error: any) {
          this.logger.error(
            `Failed to process message with id(${message.id}) on subscription (${subscription.name}). Error: ${error.message}`,
          );

          message.nack();
        }
      };

      const promise = task();

      this.outstandingMessageProcessing.add(promise);

      promise.finally(() => {
        this.outstandingMessageProcessing.delete(promise);
      });
    };

    const errorHandler = (error: Error) => {
      this.logger.error(`Subscription (${subscriptionName}) stream error: ${error.message}.`);
    };

    subscription.on('message', messageHandler);
    subscription.on('error', errorHandler);

    this.attachedHandlers.add(subscription.name);

    this.logger.log(`Handler attached to ${subscriptionName}.`);
  }

  public async attachBatchHandler(subscriptionName: string, handler: (messages: GoogleCloudPubsubMessage[]) => Promise<void>) {
    if (this.attachedHandlers.has(subscriptionName)) {
      throw new Error(`Handler attachment failed. A handler has already been attached for subscription (${subscriptionName}).`);
    }

    const subscriptionContainer = this.subscriptionContainers.get(subscriptionName);

    if (!subscriptionContainer) {
      throw new Error(`Subscription (${subscriptionName}) is not registered.`);
    }

    const subscription = subscriptionContainer.instance;
    const serializer = subscriptionContainer.topicContainer.serializer;

    const batchManager = new PubsubSubscriptionBatchManager(subscriptionContainer.configuration.batchManagerOptions);

    subscriptionContainer.batchManager = batchManager;

    batchManager.on(async (batch) => {
      try {
        const deserializedMessages = batch.map((item) => this.deserializeMessage(item.message, serializer));

        await handler(deserializedMessages);

        batch.forEach((item) => {
          item.message.ack();
          item.deferred.resolve();
        });
      } catch (error: any) {
        this.logger.error(`Failed to process batch messages on subscription (${subscription.name}). Error: ${error.message}`);

        batch.forEach((item) => {
          item.message.nack();
          item.deferred.resolve();
        });
      }
    });

    const messageHandler = (message: Message) => {
      const task = batchManager.add(message);

      this.outstandingMessageProcessing.add(task);

      task.finally(() => {
        this.outstandingMessageProcessing.delete(task);
      });
    };

    const errorHandler = (error: Error) => {
      this.logger.error(`Subscription (${subscriptionName}) stream error: ${error.message}.`);
    };

    subscription.on('message', messageHandler);
    subscription.on('error', errorHandler);

    this.attachedHandlers.add(subscription.name);
    this.logger.log(`Handler attached to ${subscriptionName}.`);
  }

  private deserializeMessage(message: Message, serializer: PubsubSerializer): GoogleCloudPubsubMessage {
    return {
      attributes: message.attributes,
      data: serializer.deserialize(message),
      deliveryAttempt: message.deliveryAttempt,
      id: message.id,
      orderingKey: message.orderingKey,
      publishTime: message.publishTime,
    };
  }

  private async connectAndValidateTopic(configuration: PubsubTopicConfiguration) {
    const { name, publishOptions, schema } = configuration;

    const topic = this.pubsub.topic(name, publishOptions);
    const [exists] = await topic.exists();

    if (!exists) {
      throw new PubsubConfigurationMismatchError(name, {
        key: 'name',
        local: name,
        remote: null,
      });
    }

    const topicContainer = new PubsubTopicContainer(topic, configuration, new PubsubSerializer(name, schema));

    await this.pubsubSchemaClient.connectAndValidateSchema(topicContainer);

    this.topicContainers.set(name, topicContainer);

    return topicContainer;
  }

  private async connectAndValidateSubscription(
    topicContainer: PubsubTopicContainer,
    configuration: PubsubSubscriptionConfiguration,
  ) {
    const { name, options } = configuration;

    const subscription = topicContainer.instance.subscription(name, options);

    try {
      const [metadata] = await subscription.getMetadata();
      const remoteTopicName = metadata.topic?.split('/').pop();

      if (topicContainer.configuration.name !== remoteTopicName) {
        throw new PubsubConfigurationMismatchError(topicContainer.configuration.name, {
          key: 'subscription.topic.name',
          local: topicContainer.configuration.name,
          remote: remoteTopicName,
        });
      }
    } catch (error) {
      if ((error as { code: number }).code === 5) {
        throw new PubsubConfigurationMismatchError(topicContainer.configuration.name, {
          key: 'subscription.name',
          local: name,
          remote: null,
        });
      }

      throw error;
    }

    const subscriptionContainer = new PubsubSubscriptionContainer(subscription, configuration, topicContainer);

    this.subscriptionContainers.set(name, subscriptionContainer);
  }
}
