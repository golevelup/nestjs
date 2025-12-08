import { PubsubTopicConfiguration } from '@golevelup/nestjs-google-cloud-pubsub';
import { PubSub } from '@google-cloud/pubsub';
import { google } from '@google-cloud/pubsub/build/protos/protos';
import { readFile } from 'fs/promises';
import path from 'path';
import { topics } from './google-cloud-pubsub.config';

const pubsub = new PubSub({});

// DO NOT RUN ON PRODUCTION
// Do not forget give access for publishing to DLQ topic for your subscription
async function bootstrap() {
  for (const topicConfiguration of topics as readonly PubsubTopicConfiguration[]) {
    if (topicConfiguration.name.endsWith('.dead-letter-queue')) {
      continue;
    }

    const topicName = topicConfiguration.name;

    const dlqTopicName = `${topicName}.dead-letter-queue`;
    const dlqSubName = `${dlqTopicName}.subscription`;

    const topicInstance = pubsub.topic(topicName);
    const dlqTopicInstance = pubsub.topic(dlqTopicName);

    const [topicExists] = await topicInstance.exists();

    if (topicExists) {
      await topicInstance.delete();
    }

    const [dlqExists] = await dlqTopicInstance.exists();

    if (dlqExists) {
      await dlqTopicInstance.delete();
    }

    if (topicConfiguration.schema) {
      const schemaInstance = pubsub.schema(topicConfiguration.schema.name);

      try {
        await schemaInstance.delete();
      } catch {}
    }

    let fullSchemaName: string | undefined;

    if (topicConfiguration.schema) {
      let definition: string;

      if (topicConfiguration.schema.type === 'AVRO') {
        definition = JSON.stringify(topicConfiguration.schema.definition);
      } else {
        definition = await readFile(path.resolve(topicConfiguration.schema.protoPath), 'utf-8');
      }

      const createdSchema = await pubsub.createSchema(topicConfiguration.schema.name, topicConfiguration.schema.type, definition);

      fullSchemaName = await createdSchema.getName();
    }

    const [createdDlqTopic] = await pubsub.createTopic(dlqTopicName);

    await createdDlqTopic.createSubscription(dlqSubName);

    const options: google.pubsub.v1.ITopic = {
      name: topicName,
    };

    if (fullSchemaName && topicConfiguration.schema) {
      options.schemaSettings = {
        schema: fullSchemaName,
        encoding: topicConfiguration.schema.encoding,
      };
    }

    const [createdTopic] = await pubsub.createTopic(options);

    if (topicConfiguration.subscriptions.length) {
      for (const subscriptionConfiguration of topicConfiguration.subscriptions) {
        await createdTopic.createSubscription(subscriptionConfiguration.name, {
          deadLetterPolicy: {
            maxDeliveryAttempts: 5,
            deadLetterTopic: createdDlqTopic.name,
          },
        });
      }
    }
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
