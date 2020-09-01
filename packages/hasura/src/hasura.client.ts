import fetch, { Response } from 'node-fetch';
import {
  HasuraMetaData,
  HasuraCustomTypesMeta,
} from './hasura.events.interfaces';

export class HasuraClient {
  private readonly endpoint: string;

  constructor(endpoint: string, private readonly adminSecret: string) {
    // TODO: Get this in a more robust way
    this.endpoint = endpoint.replace('graphql', 'query');
  }

  async exportMetadata(): Promise<HasuraMetaData> {
    const response = await this.makeRequest('export_metadata', {});
    const json = await response.json();
    return json as HasuraMetaData;
  }

  async setCustomTypes(customTypes: HasuraCustomTypesMeta): Promise<void> {
    console.log(`CUSTOM TYPES: `, JSON.stringify(customTypes));
    const response = await this.makeRequest('set_custom_types', customTypes);
    const json = await response.json();
    console.log(`SET CUSTOM TYPES: `, JSON.stringify(json));
  }

  private async makeRequest(type: string, args: object): Promise<Response> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        ['x-hasura-admin-secret']: this.adminSecret,
      },
      body: JSON.stringify({
        type,
        args,
      }),
    });

    return response;
  }
}
