import { Module } from '@nestjs/common';
import { WmsService } from './wms.service';
import { WmsClient } from './wms.client';
import { WmsController } from './wms.controller';

@Module({
  controllers: [WmsController],
  providers: [WmsService, WmsClient],
  exports: [WmsService],
})
export class WmsModule {}
