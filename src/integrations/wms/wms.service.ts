import { Injectable } from '@nestjs/common';
import { WmsClient } from './wms.client';

@Injectable()
export class WmsService {
  constructor(private readonly wmsClient: WmsClient) {}

  async getStock(): Promise<unknown> {
    return this.wmsClient.fetchStock();
  }
}
