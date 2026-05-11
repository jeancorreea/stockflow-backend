import { Controller, Get, Post, Body } from '@nestjs/common';
import { ModulesService } from './modules.service';

@Controller('modules')
export class ModulesController {
  constructor(private readonly service: ModulesService) {}

  @Get()
  findAll() {
    return { modules: this.service.findAll() };
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }
}
