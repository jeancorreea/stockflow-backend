import { Controller, Get } from '@nestjs/common';
import { WmsService } from './wms.service';

@Controller('wms')
export class WmsController {
  constructor(private readonly wmsService: WmsService) {}

  @Get('stock')
  getStock() {
    return this.wmsService.getStock();
  }
}
