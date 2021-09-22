import {
  GraphileWorkerModule,
  GRAPHILE_WORKER_UTILS_TOKEN,
  GraphileWorkerHandler,
} from '@golevelup/nestjs-graphile-worker';
import { INestApplication } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WorkerUtils } from 'graphile-worker';

const TASK_NAME = 'handleWork';
const handler = jest.fn();

const CRON_TASK_NAME = 'handleCronWork';
const cronHandler = jest.fn();

@Injectable()
class WorkerService {
  @GraphileWorkerHandler({
    name: TASK_NAME,
  })
  public handleWork(args: {}) {
    handler(args);
  }

  @GraphileWorkerHandler({
    name: CRON_TASK_NAME,
    cron: {
      pattern: '* * * * *',
      options: {
        backfillPeriod: 300000,
      },
    },
  })
  public handleCronWork(args: {}) {
    cronHandler(args);
  }
}

describe('graphile workers', () => {
  let app: INestApplication;
  let workerUtils: WorkerUtils;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        GraphileWorkerModule.forRoot(GraphileWorkerModule, {
          connectionString: 'postgresql://postgres:password@localhost:33432',
        }),
      ],
      providers: [WorkerService],
    }).compile();

    app = moduleFixture.createNestApplication();
    workerUtils = app.get<WorkerUtils>(GRAPHILE_WORKER_UTILS_TOKEN);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('processes queued jobs', async (done) => {
    expect.assertions(3);
    expect(workerUtils).toBeDefined();

    const message = { message: 'hello' };
    const job = await workerUtils.addJob(TASK_NAME, message);

    setTimeout(() => {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(message);
      done();
    }, 100);
  });

  it('processes cron jobs', async (done) => {
    setTimeout(() => {
      expect(cronHandler.mock.calls.length).toBeGreaterThanOrEqual(3);
      done();
    }, 100);
  });
});
