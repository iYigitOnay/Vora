import { IsString, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class TemplateItemDto {
  @IsString()
  foodId: string;

  @IsNumber()
  @Min(1)
  amount: number;
}

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateItemDto)
  items: TemplateItemDto[];
}
