import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  foodId: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minLimit?: number;
}
