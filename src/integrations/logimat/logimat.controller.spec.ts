import { Test, TestingModule } from '@nestjs/testing';
import { LogimatController } from './logimat.controller';

describe('LogimatController', () => {
  let controller: LogimatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogimatController],
    }).compile();

    controller = module.get<LogimatController>(LogimatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
