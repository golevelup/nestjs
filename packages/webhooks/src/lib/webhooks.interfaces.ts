export interface WebhooksModuleProvidedConfig {
  requestRawBodyProperty?: string;
}

export type WebhooksModuleConfig = Required<WebhooksModuleProvidedConfig>;
