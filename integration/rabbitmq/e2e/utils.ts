export const RABBIT_HOST = process.env.RABBITMQ_HOST ?? 'localhost';

export const RABBIT_PORT = Number(process.env.RABBITMQ_PORT ?? 5672);

export const getRabbitMQUri = (): string =>
  `amqp://rabbitmq:rabbitmq@${RABBIT_HOST}:${RABBIT_PORT}`;
