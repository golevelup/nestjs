import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

const nonJsonRpcRoutingKey = 'non-json-rpc-2';
const nonJsonSubmoduleRpcRoutingKey = 'non-json-rpc-submodule';

describe('Rabbit Controller RPC', () => {
  let app: INestApplication;
  let amqpConnection: AmqpConnection;

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    amqpConnection = app.get<AmqpConnection>(AmqpConnection);
    await app.init();
  });

  it('regular RPC handler should receive a valid RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: 'rpc-2',
      payload: {
        request: 'val',
      },
    });

    expect(response).toEqual({ echo: { request: 'val' } });
  });

  it('intercepted RPC handler should receive a transformed RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: 'intercepted-rpc-2',
    });

    expect(response).toEqual({ transformed: { message: 42 } });
  });

  it('guarded RPC handler should receive a RPC error response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: 'guarded-rpc-2',
      payload: 41,
    });

    expect(response).toHaveProperty('message');
    expect(response).toMatchObject({ status: 'error' });
  });

  it('guarded RPC handler should receive a RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: 'guarded-rpc-2',
      payload: 42,
    });

    expect(response).toEqual({ message: 'success' });
  });

  it('piped RPC handler should receive a RPC error response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: 'piped-rpc-2',
      payload: 41,
    });

    expect(response).toHaveProperty('message');
    expect(response).toMatchObject({ status: 'error' });
  });

  it('piped RPC handler should receive a RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: 'piped-rpc-2',
      payload: 42,
    });

    expect(response).toEqual({ message: 42 });
  });

  it('piped RPC handler should receive a RPC error response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: 'piped-param-rpc-2',
      payload: 41,
    });

    expect(response).toHaveProperty('message');
    expect(response).toMatchObject({ status: 'error' });
  });

  it('piped RPC handler should receive a RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: 'piped-param-rpc-2',
      payload: 42,
    });

    expect(response).toEqual({ message: 42 });
  });

  it('error reply RPC handler with non-JSON message should return an RPC error response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: 'error-reply-rpc-2',
      payload: Buffer.from('{a:'),
    });

    expect(response).toHaveProperty('message');
    expect(response).toMatchObject({ status: 'error' });
  });

  it('non-JSON RPC handler with should receive a valid RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: nonJsonRpcRoutingKey,
      payload: {
        request: 'val',
      },
    });

    expect(response).toEqual({ echo: { request: 'val' } });
  });

  it('non-JSON RPC handler with undefined message should receive a valid RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: nonJsonRpcRoutingKey,
      payload: Buffer.alloc(0),
    });

    expect(response).toEqual({ echo: undefined });
  });

  it('non-JSON RPC handler with unparsable message should receive a valid RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: nonJsonRpcRoutingKey,
      payload: Buffer.from('{a:'),
    });

    expect(response).toEqual({ echo: undefined });
  });

  it('SUBMODULE: regular RPC handler should receive a valid RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: 'rpc-submodule',
      payload: {
        request: 'val',
      },
    });

    expect(response).toEqual({ echo: { request: 'val' } });
  });

  it('SUBMODULE: intercepted RPC handler should receive a transformed RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: 'intercepted-rpc-submodule',
    });

    expect(response).toEqual({ transformed: { message: 42 } });
  });

  it('SUBMODULE: guarded RPC handler should receive a RPC error response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: 'guarded-rpc-submodule',
      payload: 41,
    });

    expect(response).toHaveProperty('message');
    expect(response).toMatchObject({ status: 'error' });
  });

  it('SUBMODULE: guarded RPC handler should receive a RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: 'guarded-rpc-submodule',
      payload: 42,
    });

    expect(response).toEqual({ message: 'success' });
  });

  it('SUBMODULE: piped RPC handler should receive a RPC error response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: 'piped-rpc-submodule',
      payload: 41,
    });

    expect(response).toHaveProperty('message');
    expect(response).toMatchObject({ status: 'error' });
  });

  it('SUBMODULE: piped RPC handler should receive a RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: 'piped-rpc-submodule',
      payload: 42,
    });

    expect(response).toEqual({ message: 42 });
  });

  it('SUBMODULE: piped RPC handler should receive a RPC error response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: 'piped-param-rpc-submodule',
      payload: 41,
    });

    expect(response).toHaveProperty('message');
    expect(response).toMatchObject({ status: 'error' });
  });

  it('SUBMODULE: piped RPC handler should receive a RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: 'piped-param-rpc-submodule',
      payload: 42,
    });

    expect(response).toEqual({ message: 42 });
  });

  it('SUBMODULE: error reply RPC handler with non-JSON message should return an RPC error response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: 'error-reply-rpc-submodule',
      payload: Buffer.from('{a:'),
    });

    expect(response).toHaveProperty('message');
    expect(response).toMatchObject({ status: 'error' });
  });

  it('SUBMODULE: non-JSON RPC handler with should receive a valid RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: nonJsonSubmoduleRpcRoutingKey,
      payload: {
        request: 'val',
      },
    });

    expect(response).toEqual({ echo: { request: 'val' } });
  });

  it('SUBMODULE: non-JSON RPC handler with undefined message should receive a valid RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: nonJsonSubmoduleRpcRoutingKey,
      payload: Buffer.alloc(0),
    });

    expect(response).toEqual({ echo: undefined });
  });

  it('SUBMODULE: non-JSON RPC handler with unparsable message should receive a valid RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange2',
      routingKey: nonJsonSubmoduleRpcRoutingKey,
      payload: Buffer.from('{a:'),
    });

    expect(response).toEqual({ echo: undefined });
  });
});
