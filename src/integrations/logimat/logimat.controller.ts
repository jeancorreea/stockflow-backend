import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { LogimatService } from './logimat.service';
import type { CallbackInput } from './logimat.service';

@Controller('logimat')
export class LogimatController {
  constructor(private readonly logimatService: LogimatService) {}

  @Get()
  findAll() {
    return this.logimatService.findAll();
  }

  @Get('status-summary')
  getStatusSummary() {
    return this.logimatService.getStatusSummary();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logimatService.findOne(Number(id));
  }

  @Post('storage')
  async createStorage(
    @Body()
    body: {
      orderId: string;
      sku: string;
      quantity: number;
      zone: string;
    },
  ) {
    return this.logimatService.createStorage(body);
  }
  @Post('callback')
  async callback(@Body() body: CallbackInput) {
    return this.logimatService.handleCallback(body);
  }
}
