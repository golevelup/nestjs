import {
  AmqpConnection,
  AmqpConnectionManager,
} from '@golevelup/nestjs-rabbitmq';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppWithSubModuleModule } from '../src/app-with-submodule.module';

const prefix = 'named-connection-submodule';
const nonJsonRpcRoutingKey = `${prefix}-non-json-rpc`;
const connectionName = 'test-connection';

describe('Rabbit Controller RPC', () => {
  let app: INestApplication;
  let amqpConnectionManager: AmqpConnectionManager;
  let amqpConnection: AmqpConnection;

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppWithSubModuleModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    amqpConnectionManager = app.get<AmqpConnectionManager>(
      AmqpConnectionManager,
    );
    console.log(amqpConnectionManager);
    amqpConnection = amqpConnectionManager.getConnection(
      connectionName,
    ) as AmqpConnection;
    await app.init();
  });

  it('regular RPC handler should receive a valid RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: `${prefix}-exchange`,
      routingKey: `${prefix}-rpc`,
      payload: {
        request: 'val',
      },
    });

    expect(response).toEqual({ echo: { request: 'val' } });
  });

  it('intercepted RPC handler should receive a transformed RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: `${prefix}-exchange`,
      routingKey: `${prefix}-intercepted-rpc`,
    });

    expect(response).toEqual({ transformed: { message: 42 } });
  });

  it('guarded RPC handler should receive a RPC error response', async () => {
    const response = await amqpConnection.request({
      exchange: `${prefix}-exchange`,
      routingKey: `${prefix}-guarded-rpc`,
      payload: 41,
    });

    expect(response).toHaveProperty('message');
    expect(response).toMatchObject({ status: 'error' });
  });

  it('guarded RPC handler should receive a RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: `${prefix}-exchange`,
      routingKey: `${prefix}-guarded-rpc`,
      payload: 42,
    });

    expect(response).toEqual({ message: 'success' });
  });

  it('piped RPC handler should receive a RPC error response', async () => {
    const response = await amqpConnection.request({
      exchange: `${prefix}-exchange`,
      routingKey: `${prefix}-piped-rpc`,
      payload: 41,
    });

    expect(response).toHaveProperty('message');
    expect(response).toMatchObject({ status: 'error' });
  });

  it('piped RPC handler should receive a RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: `${prefix}-exchange`,
      routingKey: `${prefix}-piped-rpc`,
      payload: 42,
    });

    expect(response).toEqual({ message: 42 });
  });

  it('piped RPC handler should receive a RPC error response', async () => {
    const response = await amqpConnection.request({
      exchange: `${prefix}-exchange`,
      routingKey: `${prefix}-piped-param-rpc`,
      payload: 41,
    });

    expect(response).toHaveProperty('message');
    expect(response).toMatchObject({ status: 'error' });
  });

  it('piped RPC handler should receive a RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: `${prefix}-exchange`,
      routingKey: `${prefix}-piped-param-rpc`,
      payload: 42,
    });

    expect(response).toEqual({ message: 42 });
  });

  it('error reply RPC handler with non-JSON message should return an RPC error response', async () => {
    const response = await amqpConnection.request({
      exchange: `${prefix}-exchange`,
      routingKey: `${prefix}-error-reply-rpc`,
      payload: Buffer.from('{a:'),
    });

    expect(response).toHaveProperty('message');
    expect(response).toMatchObject({ status: 'error' });
  });

  it('non-JSON RPC handler with should receive a valid RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: `${prefix}-exchange`,
      routingKey: nonJsonRpcRoutingKey,
      payload: {
        request: 'val',
      },
    });

    expect(response).toEqual({ echo: { request: 'val' } });
  });

  it('non-JSON RPC handler with undefined message should receive a valid RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: `${prefix}-exchange`,
      routingKey: nonJsonRpcRoutingKey,
      payload: Buffer.alloc(0),
    });

    expect(response).toEqual({ echo: undefined });
  });

  it('non-JSON RPC handler with unparsable message should receive a valid RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: `${prefix}-exchange`,
      routingKey: nonJsonRpcRoutingKey,
      payload: Buffer.from('{a:'),
    });

    expect(response).toEqual({ echo: undefined });
  });
});
