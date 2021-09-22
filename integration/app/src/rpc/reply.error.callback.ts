import * as amqplib from 'amqplib';

export function ReplyErrorCallback(
  channel: amqplib.Channel,
  msg: amqplib.ConsumeMessage,
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
