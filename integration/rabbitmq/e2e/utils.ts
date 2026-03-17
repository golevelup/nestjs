import { inject } from 'vitest';

export const RABBIT_HOST = inject<string>('RABBITMQ_HOST') ?? 'localhost';

export const RABBIT_PORT = Number(inject<string>('RABBITMQ_PORT') ?? 5672);

export const getRabbitMQUri = (): string =>
  `amqp://rabbitmq:rabbitmq@${RABBIT_HOST}:${RABBIT_PORT}`;
