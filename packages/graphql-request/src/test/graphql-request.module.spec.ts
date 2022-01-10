import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { GraphQLClient } from 'graphql-request';
import { GraphQLRequestModule } from '../graphql-request.module';
import { GraphQLClientInject } from './../graphql-request.constants';

describe('GraphQL Request Module', () => {
  let app: INestApplication;
  let client: GraphQLClient;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        GraphQLRequestModule.forRoot(GraphQLRequestModule, {
          endpoint: 'some-graphql-endpoint',
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    client = app.get<GraphQLClient>(GraphQLClientInject);
  });

  it('provides a graphql client', () => {
    expect(client).toBeInstanceOf(GraphQLClient);
  });
});
