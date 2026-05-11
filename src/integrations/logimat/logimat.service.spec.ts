import { Test, TestingModule } from '@nestjs/testing';
import { LogimatService } from './logimat.service';

describe('LogimatService', () => {
  let service: LogimatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogimatService],
    }).compile();

    service = module.get<LogimatService>(LogimatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
