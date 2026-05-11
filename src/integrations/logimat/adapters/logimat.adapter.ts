import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

type WmsPayload = {
  items: Array<{
    id: number;
    converter: 'XmlConverter';
    data: string;
  }>;
};

type WmsMockResponse = {
  simulated: true;
  message: string;
};

function getErrorDetail(error: unknown): unknown {
  if (axios.isAxiosError(error)) {
    return error.response?.data ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return error;
}

@Injectable()
export class LogimatAdapter {
  private readonly logger = new Logger(LogimatAdapter.name);
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('WMS_BASE_URL')!;
  }

  async sendTelegram(xml: string): Promise<unknown> {
    const mock = this.configService.get<string>('WMS_MOCK');

    if (mock === 'true') {
      this.logger.log('MOCK ATIVO - simulando envio para WMS');

      const response: WmsMockResponse = {
        simulated: true,
        message: 'Envio mockado com sucesso',
      };

      return response;
    }

    const payload: WmsPayload = {
      items: [
        {
          id: Date.now(),
          converter: 'XmlConverter',
          data: xml,
        },
      ],
    };

    try {
      this.logger.log('Enviando telegrama para WMS...');

      const response = await axios.post<unknown>(
        `${this.baseUrl}/services/di/2.0.0/HOST/messages`,
        payload,
        {
          timeout: 10000,
        },
      );

      this.logger.log('Telegrama enviado com sucesso');

      return response.data;
    } catch (error: unknown) {
      this.logger.error('Erro ao enviar telegrama', getErrorDetail(error));

      throw error;
    }
  }
}
