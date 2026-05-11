import { Controller, Get } from '@nestjs/common';
import { LogimatAnalyticsService } from './logimat.analytics.service';

@Controller('logimat/analytics')
export class LogimatAnalyticsController {
  constructor(private readonly service: LogimatAnalyticsService) {}

  @Get('aging')
  aging() {
    return this.service.aging();
  }

  @Get('abc')
  abc() {
    return this.service.abc();
  }

  @Get('pareto')
  pareto() {
    return this.service.pareto();
  }

  @Get('productivity')
  productivity() {
    return this.service.productivity();
  }

  @Get('patterns')
  patterns() {
    return this.service.patterns();
  }

  @Get('forecast')
  forecast() {
    return this.service.forecast();
  }

  @Get('timeline')
  timeline() {
    return this.service.timeline();
  }

  @Get('status-timeline')
  statusTimeline() {
    return this.service.statusTimeline();
  }
}
