import { Module } from '@nestjs/common';
import { LogimatService } from './logimat.service';
import { LogimatController } from './logimat.controller';
import { LogimatAdapter } from './adapters/logimat.adapter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogimatEntity } from './entities/logimat.entity';
import { LogimatRetryService } from './logimat.retry';
import { LogimatAnalyticsService } from './logimat.analytics.service';
import { LogimatAnalyticsController } from './logimat.analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LogimatEntity])],
  controllers: [LogimatController, LogimatAnalyticsController],
  providers: [
    LogimatService,
    LogimatAdapter,
    LogimatRetryService,
    LogimatAnalyticsService,
  ],
})
export class LogimatModule {}
