import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FoodService } from './food.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @UseGuards(JwtAuthGuard)
  @Get('barcode/:barcode')
  scanBarcode(@Param('barcode') barcode: string, @Request() req) {
    return this.foodService.scanBarcode(barcode, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  search(@Query('q') query: string, @Request() req) {
    return this.foodService.search(query, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('manual')
  createManual(@Body() data: any, @Request() req) {
    return this.foodService.createManual(data, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('vision')
  @UseInterceptors(FileInterceptor('image'))
  analyzeImage(@UploadedFile() file: any, @Request() req) {
    return this.foodService.analyzeImage(file, req.user.userId);
  }
}
