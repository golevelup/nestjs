import { AmqpConnection } from '../amqp/connection';

const mockConsumerTag = 'amq.ctag-mock';

const mockChannel = 'mockChannel';
const mockConfig = {
  hostname: 'localhost',
  port: 5672,
  username: 'guest',
  password: 'guest',
  vhost: '/',
  uri: 'amqp://guest:guest@localhost:5672/',
};

describe('AmqpConnection', () => {
  let connection: AmqpConnection;

  beforeEach(async () => {
    jest
      .spyOn(AmqpConnection.prototype as any, 'selectManagedChannel')
      .mockReturnValue({
        addSetup: jest.fn((callback) => callback(mockChannel)),
      });
    jest
      .spyOn(AmqpConnection.prototype as any, 'setupSubscriberChannel')
      .mockReturnValue(mockConsumerTag);
    jest
      .spyOn(AmqpConnection.prototype as any, 'setupRpcChannel')
      .mockReturnValue(mockConsumerTag);

    connection = new AmqpConnection(mockConfig);
  });

  it('should return consumer tag when resolves', async () => {
    const mockHandler = jest.fn();
    const mockMsgOptions = { queueOptions: { channel: mockChannel } };
    const mockHandlerName = 'mockHandlerName';
    const mockConsumeOptions = {};

    const result = await connection.createSubscriber(
      mockHandler,
      mockMsgOptions,
      mockHandlerName,
      mockConsumeOptions
    );

    expect(result).toEqual({ consumerTag: mockConsumerTag });
  });

  it('should return consumer tag when resolves', async () => {
    const mockHandler = jest.fn();
    const mockRpcOptions = { queueOptions: { channel: mockChannel } };

    const result = await connection.createRpc(mockHandler, mockRpcOptions);

    expect(result).toEqual({ consumerTag: mockConsumerTag });
  });
});
