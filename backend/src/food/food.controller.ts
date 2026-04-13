import { Controller, Get, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { FoodService } from './food.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @UseGuards(JwtAuthGuard)
  @Get('scan/:barcode')
  scanBarcode(@Param('barcode') barcode: string, @Request() req) {
    return this.foodService.scanBarcode(barcode, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  search(@Query('q') query: string, @Request() req) {
    return this.foodService.search(query, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('manual')
  createManual(@Body() data: any, @Request() req) {
    return this.foodService.createManual(data, req.user.id);
  }
}
