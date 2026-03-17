import {
  vi,
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from 'vitest';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { randomUUID } from 'crypto';

const nonJsonRpcRoutingKey = 'non-json-rpc';

describe('Rabbit RPC', () => {
  let app: INestApplication;
  let amqpConnection: AmqpConnection;

  afterEach(() => {
    vi.clearAllMocks();
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
      exchange: 'exchange1',
      routingKey: 'rpc',
      payload: {
        request: 'val',
      },
    });

    expect(response).toEqual({ echo: { request: 'val' } });
  });

  it('multiple RPC handler should receive a valid RPC response in parallel', async () => {
    const correlationId = randomUUID();
    const firstResponse = await amqpConnection.request({
      exchange: 'exchange1',
      routingKey: 'delay-rpc',
      correlationId,
      headers: { 'X-Request-ID': randomUUID() },
      payload: {
        request: 'first request',
        delay: 1000,
      },
    });
    const secondResponse = await amqpConnection.request({
      exchange: 'exchange1',
      routingKey: 'delay-rpc',
      correlationId,
      headers: { 'X-Request-ID': randomUUID() },
      payload: {
        request: 'second request',
        delay: 20,
      },
    });

    expect(firstResponse).toEqual({ echo: { request: 'first request' } });
    expect(secondResponse).toEqual({ echo: { request: 'second request' } });
  });

  it('intercepted RPC handler should receive a transformed RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange1',
      routingKey: 'intercepted-rpc',
    });

    expect(response).toEqual({ transformed: { message: 42 } });
  });

  it('error reply RPC handler with non-JSON message should return an RPC error response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange1',
      routingKey: 'error-reply-rpc',
      payload: Buffer.from('{a:'),
    });

    expect(response).toHaveProperty('message');
    expect(response).toMatchObject({ status: 'error' });
  });

  it('non-JSON RPC handler with should receive a valid RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange1',
      routingKey: nonJsonRpcRoutingKey,
      payload: {
        request: 'val',
      },
    });

    expect(response).toEqual({ echo: { request: 'val' } });
  });

  it('non-JSON RPC handler with undefined message should receive a valid RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange1',
      routingKey: nonJsonRpcRoutingKey,
      payload: Buffer.alloc(0),
    });

    expect(response).toEqual({ echo: '' });
  });

  it('non-JSON RPC handler with unparsable message should receive a valid RPC response', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange1',
      routingKey: nonJsonRpcRoutingKey,
      payload: Buffer.from('{a:'),
    });

    expect(response).toEqual({ echo: '{a:' });
  });

  it('should route to correct handler when RPC handlers share a queue', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange1',
      routingKey: 'shared-rpc-1',
      payload: { test: 'handler1' },
    });

    expect(response).toEqual({
      echo: { test: 'handler1' },
      handler: 'shared-rpc-1',
    });
  });

  it('should route to second handler on shared queue', async () => {
    const response = await amqpConnection.request({
      exchange: 'exchange1',
      routingKey: 'shared-rpc-2',
      payload: { test: 'handler2' },
    });

    expect(response).toEqual({
      echo: { test: 'handler2' },
      handler: 'shared-rpc-2',
    });
  });

  it('should handle parallel requests to shared queue handlers', async () => {
    const [res1, res2] = await Promise.all([
      amqpConnection.request({
        exchange: 'exchange1',
        routingKey: 'shared-rpc-1',
        payload: { n: 1 },
      }),
      amqpConnection.request({
        exchange: 'exchange1',
        routingKey: 'shared-rpc-2',
        payload: { n: 2 },
      }),
    ]);

    expect(res1).toEqual({ echo: { n: 1 }, handler: 'shared-rpc-1' });
    expect(res2).toEqual({ echo: { n: 2 }, handler: 'shared-rpc-2' });
  });
});
