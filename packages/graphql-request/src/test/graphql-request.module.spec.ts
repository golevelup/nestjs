import { Test } from '@nestjs/testing';
import { GraphQLClient } from 'graphql-request';
import { GraphQLRequestModule } from '../graphql-request.module';
import { GraphQLClientInject } from './../graphql-request.constants';

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
});
