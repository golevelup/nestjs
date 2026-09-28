"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCloudPubsubBatchSubscribe = exports.GoogleCloudPubsubSubscribe = exports.GoogleCloudPubsubPublisher = exports.topics = void 0;
const nestjs_google_cloud_pubsub_1 = require("@golevelup/nestjs-google-cloud-pubsub");
const level5_1 = require("../proto/level5");
exports.topics = [
    {
        name: 'order.created',
        schema: {
            definition: {
                fields: [
                    { name: 'field1', type: 'string' },
                    { name: 'field2', type: 'int' },
                    { name: 'field3', type: 'boolean' },
                    { name: 'field4', type: 'double' },
                    {
                        name: 'field5',
                        type: {
                            fields: [{ name: 'nestedField1', type: 'string' }],
                            name: 'Nested1',
                            type: 'record',
                        },
                    },
                    { name: 'field6', type: ['double', 'null'] },
                ],
                name: 'Level3',
                type: 'record',
            },
            encoding: 'BINARY',
            name: 'order.created.schema',
            type: 'AVRO',
        },
        subscriptions: [
            {
                name: 'order.created.subscription.order-processor-service',
                batchManagerOptions: { maxMessages: 15 },
            },
            { name: 'order.created.subscription.analytic-service' },
        ],
    },
    {
        name: 'order.created.dead-letter-queue',
        subscriptions: [{ name: 'order.created.dead-letter-queue.subscription' }],
    },
    {
        name: 'payment.processed',
        schema: {
            definition: level5_1.Level5ProtocolBuffer,
            encoding: 'BINARY',
            name: 'payment.processed.schema',
            type: 'PROTOCOL_BUFFER',
        },
        subscriptions: [
            { name: 'payment.processed.payment-processor-service' },
            { name: 'payment.processed.analytic-service' },
        ],
    },
    {
        name: 'payment.processed.dead-letter-queue',
        subscriptions: [
            { name: 'payment.processed.dead-letter-queue.subscription' },
        ],
    },
];
const googleCloudPubsubKit = nestjs_google_cloud_pubsub_1.GoogleCloudPubsubModule.initializeKit();
const { GoogleCloudPubsubAbstractPublisher, GoogleCloudPubsubBatchSubscribe, GoogleCloudPubsubSubscribe, } = googleCloudPubsubKit;
exports.GoogleCloudPubsubBatchSubscribe = GoogleCloudPubsubBatchSubscribe;
exports.GoogleCloudPubsubSubscribe = GoogleCloudPubsubSubscribe;
class GoogleCloudPubsubPublisher extends GoogleCloudPubsubAbstractPublisher {
}
exports.GoogleCloudPubsubPublisher = GoogleCloudPubsubPublisher;
//# sourceMappingURL=google-cloud-pubsub.config.js.map