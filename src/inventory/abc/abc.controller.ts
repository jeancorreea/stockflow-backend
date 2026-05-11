import { Controller, Post, Body } from '@nestjs/common';
import { AbcService } from './abc.service';
import { AbcRequestDto } from './dto/abc.dto';

@Controller('abc')
export class AbcController {
  constructor(private readonly abcService: AbcService) {}

  @Post()
  calculate(@Body() body: AbcRequestDto) {
    return this.abcService.calculate(body.items);
  }
}
