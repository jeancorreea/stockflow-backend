import { Injectable } from '@nestjs/common';

@Injectable()
export class AbcService {
  calculate(items: { item: string; quantity: number; cost: number }[]) {
    // calcular valor
    const enriched = items.map((i) => ({
      ...i,
      value: i.quantity * i.cost,
    }));

    // ordenar (maior → menor)
    enriched.sort((a, b) => b.value - a.value);

    // total
    const total = enriched.reduce((sum, i) => sum + i.value, 0);

    let accumulated = 0;

    // calcular % e classe
    return enriched.map((i) => {
      const percentage = (i.value / total) * 100;
      accumulated += percentage;

      let classification = 'C';

      if (accumulated <= 80) classification = 'A';
      else if (accumulated <= 95) classification = 'B';

      return {
        item: i.item,
        value: i.value,
        percentage: Number(percentage.toFixed(2)),
        accumulated: Number(accumulated.toFixed(2)),
        classification,
      };
    });
  }
}
