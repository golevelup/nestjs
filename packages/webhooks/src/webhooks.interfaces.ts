export interface WebhooksModuleProvidedConfig {
  /**
   * @default 'rawBody'
   */
  requestRawBodyProperty?: string;
}

export type WebhooksModuleConfig = Required<WebhooksModuleProvidedConfig>;
