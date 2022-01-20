import { Channel, ConsumeMessage } from 'amqplib';
import { QueueOptions } from '../rabbitmq.interfaces';

export enum MessageHandlerErrorBehavior {
  ACK = 'ACK',
  NACK = 'NACK',
  REQUEUE = 'REQUEUE',
}

export type MessageErrorHandler = (
  channel: Channel,
  msg: ConsumeMessage,
  error: any
) => Promise<void> | void;

/**
 * An error handler that will ack the message which caused an error during processing
 */
export const ackErrorHandler: MessageErrorHandler = (channel, msg) => {
  channel.ack(msg);
};

/**
 * An error handler that will nack and requeue a message which created an error during processing
 */
export const requeueErrorHandler: MessageErrorHandler = (channel, msg) => {
  channel.nack(msg, false, true);
};

/**
 * An error handler that will nack a message which created an error during processing
 */
export const defaultNackErrorHandler: MessageErrorHandler = (channel, msg) => {
  channel.nack(msg, false, false);
};

export const getHandlerForLegacyBehavior = (
  behavior: MessageHandlerErrorBehavior
) => {
  switch (behavior) {
    case MessageHandlerErrorBehavior.ACK:
      return ackErrorHandler;
    case MessageHandlerErrorBehavior.REQUEUE:
      return requeueErrorHandler;
    default:
      return defaultNackErrorHandler;
  }
};

export type AssertQueueErrorHandler = (
  channel: Channel,
  queueName: string,
  queueOptions: QueueOptions | undefined,
  error: any
) => Promise<string> | string;

/**
 * Just rethrows the error
 */
export const defaultAssertQueueErrorHandler: AssertQueueErrorHandler = (
  channel: Channel,
  queueName: string,
  queueOptions: QueueOptions | undefined,
  error: any
) => {
  throw error;
};

/**
 * Tries to delete the queue and to redeclare it with the provided options
 */
export const forceDeleteAssertQueueErrorHandler: AssertQueueErrorHandler = async (
  channel: Channel,
  queueName: string,
  queueOptions: QueueOptions | undefined,
  error: any
) => {
  if (error.code == 406) {
    //406 == preconditions failed
    await channel.deleteQueue(queueName);
    const { queue } = await channel.assertQueue(queueName, queueOptions);
    return queue;
  }
  throw error;
};
