"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pubsub_1 = require("@google-cloud/pubsub");
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const google_cloud_pubsub_config_1 = require("./google-cloud-pubsub.config");
const pubsub = new pubsub_1.PubSub({});
async function bootstrap() {
    for (const topicConfiguration of google_cloud_pubsub_config_1.topics) {
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
            }
            catch { }
        }
        let fullSchemaName;
        if (topicConfiguration.schema) {
            let definition;
            if (topicConfiguration.schema.type === 'AVRO') {
                definition = JSON.stringify(topicConfiguration.schema.definition);
            }
            else {
                definition = await (0, promises_1.readFile)(path_1.default.resolve(process.cwd(), 'proto/level5.proto'), 'utf-8');
            }
            const createdSchema = await pubsub.createSchema(topicConfiguration.schema.name, topicConfiguration.schema.type, definition);
            fullSchemaName = await createdSchema.getName();
        }
        const [createdDlqTopic] = await pubsub.createTopic(dlqTopicName);
        await createdDlqTopic.createSubscription(dlqSubName);
        const options = {
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
//# sourceMappingURL=recreate-infrastructure.js.map