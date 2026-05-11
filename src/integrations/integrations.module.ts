import { Module } from '@nestjs/common';
import { LogimatModule } from './logimat/logimat.module';

@Module({
  imports: [LogimatModule],
})
export class IntegrationsModule {}
