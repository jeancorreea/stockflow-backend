import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogimatAdapter } from './adapters/logimat.adapter';
import { LogimatBuilder } from './builders/logimat.builder';
import { LogimatEntity } from './entities/logimat.entity';

type CreateStorageInput = {
  orderId: string;
  sku: string;
  quantity: number;
  zone: string;
};

type CreateStorageResult = {
  success: true;
  message: string;
  wmsResponse: unknown;
};

export type CallbackInput = {
  orderId?: unknown;
  demandNo?: unknown;
};

function getErrorDetail(error: unknown): unknown {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response
  ) {
    return error.response.data;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return error;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Erro desconhecido';
}

@Injectable()
export class LogimatService {
  private readonly logger = new Logger(LogimatService.name);

  constructor(
    private readonly adapter: LogimatAdapter,
    @InjectRepository(LogimatEntity)
    private readonly repo: Repository<LogimatEntity>,
  ) {}

  async createStorage(data: CreateStorageInput): Promise<CreateStorageResult> {
    this.logger.log(`[${data.orderId}] Iniciando ordem de armazenagem`);

    const builder = new LogimatBuilder();

    const xml = builder.buildStorageDemand({
      demandNo: data.orderId,
      itemNo: data.sku,
      quantity: data.quantity,
      zone: data.zone,
    });

    this.logger.log(`[${data.orderId}] XML gerado`);

    const request = this.repo.create({
      orderId: data.orderId,
      status: 'PENDING',
      xml,
    });

    await this.repo.save(request);

    try {
      const response = await this.adapter.sendTelegram(xml);

      this.logger.log(`[${data.orderId}] Enviado para WMS`);

      request.status = 'SENT';
      request.response = JSON.stringify(response);

      await this.repo.save(request);

      return {
        success: true,
        message: 'Ordem enviada para o SmartStorage',
        wmsResponse: response,
      };
    } catch (error: unknown) {
      this.logger.error(
        `[${data.orderId}] Erro ao enviar telegrama`,
        getErrorDetail(error),
      );

      request.status = 'RETRY';
      request.response = getErrorMessage(error);

      await this.repo.save(request);

      throw error;
    }
  }

  async handleCallback(data: CallbackInput): Promise<{ success: boolean }> {
    const orderId =
      typeof data.orderId === 'string'
        ? data.orderId
        : typeof data.demandNo === 'string'
          ? data.demandNo
          : undefined;

    if (!orderId) {
      throw new BadRequestException('orderId ou demandNo e obrigatorio');
    }

    this.logger.log(`[${orderId}] Callback recebido do WMS`);

    const request = await this.repo.findOne({
      where: { orderId },
    });

    if (!request) {
      this.logger.error(`[${orderId}] Ordem nao encontrada`);
      return { success: false };
    }

    request.status = 'SUCCESS';
    request.response = JSON.stringify(data);

    await this.repo.save(request);

    this.logger.log(`[${orderId}] Ordem finalizada com sucesso`);

    return { success: true };
  }

  async findAll(): Promise<LogimatEntity[]> {
    return this.repo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<LogimatEntity | null> {
    return this.repo.findOne({
      where: { id },
    });
  }

  async getStatusSummary(): Promise<Array<{ status: string; count: number }>> {
    const data = await this.repo
      .createQueryBuilder('logimat')
      .select('logimat.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('logimat.status')
      .getRawMany<{ status: string; count: string }>();

    return data.map((item) => ({
      status: item.status,
      count: Number(item.count),
    }));
  }
}
