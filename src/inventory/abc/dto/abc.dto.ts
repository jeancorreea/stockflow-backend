import { IsArray, IsNumber, IsString } from 'class-validator';

export class AbcItemDto {
  @IsString()
  item!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  cost!: number;
}

export class AbcRequestDto {
  @IsArray()
  items!: AbcItemDto[];
}
