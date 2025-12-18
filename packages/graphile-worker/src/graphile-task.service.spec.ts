import z from 'zod';
import { GraphileTaskService } from './graphile-worker.service.js';
import { describe, it, expect, vi } from 'vitest';
import { WorkerUtils } from 'graphile-worker';

const emailSchema = z.object({
  to: z.email(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

declare module './graphile-worker.types.js' {
  interface GraphileWorkerTaskSchemas {
    sendEmail: z.infer<typeof emailSchema>;
  }
}

describe(GraphileTaskService.name, () => {
  const workerUtilsMock = {
    addJob: vi.fn().mockResolvedValue({ id: 'id1' }),
  } as Partial<WorkerUtils> as any;

  const service = new GraphileTaskService(workerUtilsMock, {
    tasksValidationSchemas: {
      sendEmail: emailSchema,
    },
  });

  it('should throw an Error with invalid payload', async () => {
    await expect(
      service.scheduleTask('sendEmail', {
        to: 'hello@example.com',
        subject: 'Test Subject',
        body: '', // Should fail due to empty body
      }),
    ).rejects.toThrow();
  });

  it('should schedule a task successfully', async () => {
    await expect(
      service.scheduleTask('sendEmail', {
        to: 'hello@example.com',
        subject: 'Test Subject',
        body: 'Hello World',
      }),
    ).resolves.toBeDefined();
  });
});
