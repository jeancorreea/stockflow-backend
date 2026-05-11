import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogimatEntity } from './entities/logimat.entity';
import { LogimatAdapter } from './adapters/logimat.adapter';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class LogimatRetryService {
  private readonly logger = new Logger(LogimatRetryService.name);

  constructor(
    @InjectRepository(LogimatEntity)
    private readonly repo: Repository<LogimatEntity>,
    private readonly adapter: LogimatAdapter,
  ) {}

  @Cron('*/30 * * * * *') // a cada 30s
  handleRetry(): void {
    void this.retryFailed();
  }

  async retryFailed(): Promise<void> {
    const failed = await this.repo.find({
      where: { status: 'RETRY' },
      take: 10,
    });

    for (const item of failed) {
      try {
        const response = await this.adapter.sendTelegram(item.xml);

        item.status = 'SENT';
        item.response = JSON.stringify(response);

        await this.repo.save(item);

        this.logger.log(`Retry sucesso: ${item.orderId}`);
      } catch {
        this.logger.error(`Retry falhou: ${item.orderId}`);
      }
    }
  }
}
