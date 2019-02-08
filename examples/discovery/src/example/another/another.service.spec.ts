import { Test, TestingModule } from '@nestjs/testing';
import { AnotherService } from './another.service';

describe('AnotherService', () => {
  let service: AnotherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnotherService],
    }).compile();

    service = module.get<AnotherService>(AnotherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
