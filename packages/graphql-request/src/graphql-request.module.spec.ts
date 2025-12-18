import { Test } from '@nestjs/testing';
import { GraphQLClient } from 'graphql-request';
import { GraphQLRequestModule } from '../graphql-request.module.js';
import { GraphQLClientInject } from './../graphql-request.constants.js';
import { describe, it, expect } from 'vitest';

describe('GraphQL Request Module', () => {
  it('provides a graphql client', async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        GraphQLRequestModule.forRoot({
          endpoint: 'some-graphql-endpoint',
        }),
      ],
    }).compile();

    const app = moduleFixture.createNestApplication();
    const client = app.get<GraphQLClient>(GraphQLClientInject);

    expect(client).toBeInstanceOf(GraphQLClient);
  });

  it('provides a graphql client with async factory', async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        GraphQLRequestModule.forRootAsync({
          useFactory: () => ({
            endpoint: 'test',
          }),
        }),
      ],
    }).compile();

    const app = moduleFixture.createNestApplication();
    const client = app.get<GraphQLClient>(GraphQLClientInject);

    expect(client).toBeInstanceOf(GraphQLClient);
  });

  it('builds an sdk with graphql client inject', async () => {
    class MockedSdk {
      constructor(private readonly client: GraphQLClient) {}
    }

    const MOCKED_SDK_TOKEN = 'MockedSdk';

    const moduleFixture = await Test.createTestingModule({
      imports: [
        GraphQLRequestModule.forRootAsync({
          useFactory: () => ({
            endpoint: 'test',
          }),
        }),
      ],
      providers: [
        {
          provide: MOCKED_SDK_TOKEN,
          inject: [GraphQLClientInject],
          useFactory: (client: GraphQLClient) => new MockedSdk(client),
        },
      ],
    }).compile();

    const app = moduleFixture.createNestApplication();

    expect(app.get(MOCKED_SDK_TOKEN)).toBeInstanceOf(MockedSdk);
  });
});
