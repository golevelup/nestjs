import { Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkerUtils } from 'graphile-worker';
import { GraphileWorkerHandler } from './graphile-worker.decorators';
import { GRAPHILE_WORKER_UTILS_TOKEN } from './graphile-worker.constants';
import { GraphileWorkerModule } from './graphile-worker.module';
import * as graphile from 'graphile-worker';

jest.mock('graphile-worker');

const mockMakeWorkerUtils = jest
  .spyOn(graphile, 'makeWorkerUtils')
  .mockResolvedValueOnce({} as any);

const mockRun = jest.spyOn(graphile, 'run').mockResolvedValueOnce({} as any);

const CONNECTION_STRING = 'connectionString';

@Injectable()
class TestService {
  @GraphileWorkerHandler({
    name: 'test',
  })
  doSomething(args) {
    console.log(args);
  }
}

@Module({
  providers: [TestService],
  exports: [TestService],
})
class TestModule {}

describe('Graphile Worker Module', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TestModule,
        GraphileWorkerModule.forRoot(GraphileWorkerModule, {
          connectionString: CONNECTION_STRING,
        }),
      ],
    }).compile();

    await app.init();
  });

  it('can builds and provides the graphile worker utils instance', () => {
    const utils = app.get<WorkerUtils>(GRAPHILE_WORKER_UTILS_TOKEN);
    expect(utils).toBeDefined();

    expect(mockMakeWorkerUtils).toHaveBeenCalledWith({
      connectionString: CONNECTION_STRING,
    });
  });

  it('calls run with a taskList based on discovered methods decorated with GraphileWorkerHandler', () => {
    expect(mockRun).toHaveBeenLastCalledWith(
      expect.objectContaining({
        connectionString: CONNECTION_STRING,
        taskList: expect.objectContaining({
          test: expect.any(Function),
        }),
      })
    );
  });
});
