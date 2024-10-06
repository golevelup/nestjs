import type { Channel, ConsumeMessage } from 'amqplib';

export function ReplyErrorCallback(
  channel: Channel,
  msg: ConsumeMessage,
  error: any,
) {
  const { replyTo, correlationId } = msg.properties;
  if (replyTo) {
    if (error instanceof Error) {
      error = error.message;
    } else if (typeof error !== 'string') {
      error = JSON.stringify(error);
    }

    error = Buffer.from(JSON.stringify({ status: 'error', message: error }));

    channel.publish('', replyTo, error, { correlationId });
    channel.ack(msg);
  }
}
