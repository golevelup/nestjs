import { Channel, ConsumeMessage } from 'amqplib';
import { QueueOptions } from '../rabbitmq.interfaces';
import { PRECONDITION_FAILED_CODE } from '../rabbitmq.constants';

export enum MessageHandlerErrorBehavior {
  ACK = 'ACK',
  NACK = 'NACK',
  REQUEUE = 'REQUEUE',
}

type BaseMessageErrorHandler<T extends ConsumeMessage | ConsumeMessage[]> = (
  channel: Channel,
  msg: T,
  error: any
) => Promise<void> | void;

export type MessageErrorHandler = BaseMessageErrorHandler<ConsumeMessage>;

export type BatchMessageErrorHandler = BaseMessageErrorHandler<
  ConsumeMessage[]
>;

export type LegacyMessageErrorHandler = BaseMessageErrorHandler<
  ConsumeMessage | ConsumeMessage[]
>;
/**
 * An error handler that will ack the message which caused an error during processing
 */
export const ackErrorHandler: LegacyMessageErrorHandler = (channel, msg) => {
  for (const m of Array.isArray(msg) ? msg : [msg]) {
    channel.ack(m);
  }
};

/**
 * An error handler that will nack and requeue a message which created an error during processing
 */
export const requeueErrorHandler: LegacyMessageErrorHandler = (
  channel,
  msg
) => {
  for (const m of Array.isArray(msg) ? msg : [msg]) {
    channel.nack(m, false, true);
  }
};

/**
 * An error handler that will nack a message which created an error during processing
 */
export const defaultNackErrorHandler: LegacyMessageErrorHandler = (
  channel,
  msg
) => {
  for (const m of Array.isArray(msg) ? msg : [msg]) {
    channel.nack(m, false, false);
  }
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
export const forceDeleteAssertQueueErrorHandler: AssertQueueErrorHandler =
  async (
    channel: Channel,
    queueName: string,
    queueOptions: QueueOptions | undefined,
    error: any
  ) => {
    if (error.code == PRECONDITION_FAILED_CODE) {
      await channel.deleteQueue(queueName);
      const { queue } = await channel.assertQueue(queueName, queueOptions);
      return queue;
    }
    throw error;
  };
