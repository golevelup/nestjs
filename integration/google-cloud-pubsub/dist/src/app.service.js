"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const google_cloud_pubsub_config_1 = require("./google-cloud-pubsub.config");
let AppService = class AppService {
    constructor(googleCloudPubsubPublisher) {
        this.googleCloudPubsubPublisher = googleCloudPubsubPublisher;
    }
    async onApplicationBootstrap() {
        this.publish();
    }
    async publish() {
        await Promise.all(Array.from({ length: 30 }).map(async () => {
            const messageId = await this.googleCloudPubsubPublisher.publish('order.created', {
                data: {
                    field1: 'field1',
                    field2: 1,
                    field3: true,
                    field4: 4,
                    field5: { nestedField1: 'nestedField1' },
                    field6: null,
                },
            });
            console.log({ messageId });
        }));
    }
    async handle(payload) {
        console.dir({ LOG_FROM: payload }, { depth: 5 });
        throw new Error();
    }
    async handleBatch(payload) {
        console.dir({ LOG_FROM_BATCH: payload }, { depth: 5 });
    }
    async handleDlq(payload) {
        console.dir({ LOG_FROM_DLQ: payload }, { depth: 5 });
    }
};
exports.AppService = AppService;
__decorate([
    (0, google_cloud_pubsub_config_1.GoogleCloudPubsubSubscribe)('order.created', 'order.created.subscription.analytic-service'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppService.prototype, "handle", null);
__decorate([
    (0, google_cloud_pubsub_config_1.GoogleCloudPubsubBatchSubscribe)('order.created', 'order.created.subscription.order-processor-service'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], AppService.prototype, "handleBatch", null);
__decorate([
    (0, google_cloud_pubsub_config_1.GoogleCloudPubsubSubscribe)('order.created.dead-letter-queue', 'order.created.dead-letter-queue.subscription'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppService.prototype, "handleDlq", null);
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [google_cloud_pubsub_config_1.GoogleCloudPubsubPublisher])
], AppService);
//# sourceMappingURL=app.service.js.map