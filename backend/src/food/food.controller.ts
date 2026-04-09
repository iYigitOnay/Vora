import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { FoodService } from './food.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @UseGuards(JwtAuthGuard)
  @Get('scan/:barcode')
  scanBarcode(@Param('barcode') barcode: string) {
    return this.foodService.scanBarcode(barcode);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  search(@Query('q') query: string) {
    return this.foodService.search(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('manual')
  createManual(@Body() data: any) {
    return this.foodService.createManual(data);
  }
}
