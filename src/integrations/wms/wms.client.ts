import { Injectable } from '@nestjs/common';

@Injectable()
export class WmsClient {
  async fetchStock(): Promise<unknown> {
    return await Promise.resolve({
      message: 'WMS client not implemented yet',
    });
  }
}
