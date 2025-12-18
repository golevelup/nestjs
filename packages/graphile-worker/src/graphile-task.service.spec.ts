import z from 'zod';
import { GraphileTaskService } from './graphile-worker.service';
import { describe, it, expect, vi } from 'vitest';
import { WorkerUtils } from 'graphile-worker';

const emailSchema = z.object({
  to: z.email(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

declare module './graphile-worker.types' {
  interface GraphileWorkerTaskSchemas {
    sendEmail: z.infer<typeof emailSchema>;
  }
}

describe(GraphileTaskService.name, () => {
  const workerUtilsMock = {
    addJob: vi.fn().mockResolvedValue({ id: 'id1' }),
  } as Partial<WorkerUtils> as any;

  it('should schedule a task when no validation schema is defined', async () => {
    const service = new GraphileTaskService(workerUtilsMock, {
      // Notice that we're not providing the validation schemas
    });

    await expect(
      service.scheduleTask('sendEmail', {
        to: 'hello@example.com',
        subject: 'Test Subject',
        body: '', // Should fail due to empty body
      }),
    ).resolves.toBeDefined();
  });

  it('should throw an Error with invalid payload', async () => {
    const service = new GraphileTaskService(workerUtilsMock, {
      tasksValidationSchemas: {
        sendEmail: emailSchema,
      },
    });

    await expect(
      service.scheduleTask('sendEmail', {
        to: 'hello@example.com',
        subject: 'Test Subject',
        body: '', // Should fail due to empty body
      }),
    ).rejects.toThrow();
  });
});
