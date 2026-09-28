"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_google_cloud_pubsub_1 = require("@golevelup/nestjs-google-cloud-pubsub");
const google_cloud_pubsub_config_1 = require("./google-cloud-pubsub.config");
const google_cloud_pubsub_config_service_1 = require("./config/google-cloud-pubsub.config-service");
const app_service_1 = require("./app.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_google_cloud_pubsub_1.GoogleCloudPubsubModule.registerAsync({
                useClass: google_cloud_pubsub_config_service_1.GoogleCloudPubsubConfigService,
                publisher: google_cloud_pubsub_config_1.GoogleCloudPubsubPublisher,
            }),
        ],
        controllers: [],
        exports: [],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map