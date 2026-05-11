import { Injectable } from '@nestjs/common';
import { LogimatService } from './logimat.service';
import { LogimatEntity } from './entities/logimat.entity';

type AgingStatus = 'OK' | 'ATENCAO' | 'CRITICO';
type ABCClassification = 'A' | 'B' | 'C';

type OrderFrequencyItem = {
  key: string;
  total: number;
};

export type OrderWithAging = Pick<
  LogimatEntity,
  'id' | 'orderId' | 'status' | 'createdAt'
> & {
  agingDays: number;
  agingStatus: AgingStatus;
};

export type ABCItem = {
  key: string;
  total: number;
  percentage: number;
  accumulated: number;
  classification: ABCClassification;
};

export type ParetoItem = {
  name: string;
  total: number;
  accumulated: number;
};

export type ProductivityItem = {
  hour: string;
  total: number;
};

export type PatternItem = {
  day: string;
  total: number;
};

export type ForecastItem = {
  component: string;
  forecast: number;
};

export type TimelineItem = {
  date: string;
  total: number;
};

export type StatusTimelineItem = {
  date: string;
  SENT: number;
  ERROR: number;
  PENDING: number;
};

@Injectable()
export class LogimatAnalyticsService {
  constructor(private readonly logimatService: LogimatService) {}

  private async getOrders(): Promise<LogimatEntity[]> {
    return this.logimatService.findAll();
  }

  private buildOrderFrequency(orders: LogimatEntity[]): OrderFrequencyItem[] {
    const map: Record<string, number> = {};

    orders.forEach((order) => {
      map[order.orderId] = (map[order.orderId] ?? 0) + 1;
    });

    return Object.entries(map)
      .map(([key, total]) => ({ key, total }))
      .sort((a, b) => b.total - a.total);
  }

  async aging(): Promise<OrderWithAging[]> {
    const orders = await this.getOrders();
    const now = new Date();

    return orders.map((o) => {
      const createdAt = new Date(o.createdAt);
      const createdAtMs = createdAt.getTime();

      if (Number.isNaN(createdAtMs)) {
        return {
          id: o.id,
          orderId: o.orderId,
          status: o.status,
          createdAt: o.createdAt,
          agingDays: 0,
          agingStatus: 'OK',
        };
      }

      const diff = (now.getTime() - createdAtMs) / (1000 * 60 * 60 * 24);
      const agingDays = Math.max(0, Math.floor(diff));

      let agingStatus: AgingStatus = 'OK';
      if (diff > 7) agingStatus = 'CRITICO';
      else if (diff > 3) agingStatus = 'ATENCAO';

      return {
        id: o.id,
        orderId: o.orderId,
        status: o.status,
        createdAt: o.createdAt,
        agingDays,
        agingStatus,
      };
    });
  }

  async abc(): Promise<ABCItem[]> {
    const orders = await this.getOrders();
    const orderFrequency = this.buildOrderFrequency(orders);
    const totalOrders = orderFrequency.reduce(
      (sum, item) => sum + item.total,
      0,
    );

    if (totalOrders === 0) return [];

    let accumulated = 0;

    return orderFrequency.map((item) => {
      const percentage = (item.total / totalOrders) * 100;
      accumulated += percentage;

      let classification: ABCClassification = 'C';
      if (accumulated <= 80) classification = 'A';
      else if (accumulated <= 95) classification = 'B';

      return {
        key: item.key,
        total: item.total,
        percentage: Number(percentage.toFixed(2)),
        accumulated: Number(accumulated.toFixed(2)),
        classification,
      };
    });
  }

  async pareto(): Promise<ParetoItem[]> {
    const orders = await this.getOrders();
    const orderFrequency = this.buildOrderFrequency(orders);
    const totalOrders = orderFrequency.reduce(
      (sum, item) => sum + item.total,
      0,
    );

    if (totalOrders === 0) return [];

    let accumulated = 0;

    return orderFrequency.map((item) => {
      accumulated += item.total;
      return {
        name: item.key,
        total: item.total,
        accumulated: Number(((accumulated / totalOrders) * 100).toFixed(2)),
      };
    });
  }

  async productivity(): Promise<ProductivityItem[]> {
    const orders = await this.getOrders();
    const byHour = new Array<number>(24).fill(0);

    orders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      if (Number.isNaN(hour)) return;
      byHour[hour] += 1;
    });

    return byHour.map((total, hour) => ({
      hour: `${String(hour).padStart(2, '0')}:00`,
      total: Number(total),
    }));
  }

  async patterns(): Promise<PatternItem[]> {
    const orders = await this.getOrders();
    const byDay = new Array<number>(7).fill(0);

    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

    orders.forEach((order) => {
      const day = new Date(order.createdAt).getDay();
      if (Number.isNaN(day)) return;
      byDay[day] += 1;
    });

    return days.map((day, index) => ({
      day,
      total: byDay[index],
    }));
  }

  async forecast(): Promise<ForecastItem[]> {
    const orders = await this.getOrders();
    const days = new Set<string>();

    orders.forEach((order) => {
      const createdAt = new Date(order.createdAt);
      const createdAtMs = createdAt.getTime();
      if (Number.isNaN(createdAtMs)) return;
      days.add(createdAt.toISOString().slice(0, 10));
    });

    const avgPerDay = days.size > 0 ? orders.length / days.size : 0;

    return [
      { component: 'ITEM001', forecast: Math.round(avgPerDay * 2) },
      { component: 'ITEM002', forecast: Math.round(avgPerDay) },
    ];
  }

  async timeline(): Promise<TimelineItem[]> {
    const orders = await this.getOrders();
    const groupedByDate: Record<string, number> = {};

    orders.forEach((order) => {
      const createdAt = new Date(order.createdAt);
      const createdAtMs = createdAt.getTime();
      if (Number.isNaN(createdAtMs)) return;

      const date = createdAt.toISOString().slice(0, 10);
      groupedByDate[date] = (groupedByDate[date] ?? 0) + 1;
    });

    return Object.entries(groupedByDate)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async statusTimeline(): Promise<StatusTimelineItem[]> {
    const orders = await this.getOrders();
    const groupedByDate: Record<string, StatusTimelineItem> = {};

    orders.forEach((order) => {
      const createdAt = new Date(order.createdAt);
      const createdAtMs = createdAt.getTime();
      if (Number.isNaN(createdAtMs)) return;

      const date = createdAt.toISOString().slice(0, 10);

      if (!groupedByDate[date]) {
        groupedByDate[date] = {
          date,
          SENT: 0,
          ERROR: 0,
          PENDING: 0,
        };
      }

      if (order.status === 'SENT') groupedByDate[date].SENT += 1;
      else if (order.status === 'ERROR') groupedByDate[date].ERROR += 1;
      else if (order.status === 'PENDING') groupedByDate[date].PENDING += 1;
    });

    return Object.values(groupedByDate).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }
}
