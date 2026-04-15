import { Controller, Post, Get, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { MealService } from './meal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MealType } from '@prisma/client';

@Controller('meal')
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @UseGuards(JwtAuthGuard)
  @Post('log')
  logMeal(@Request() req, @Body() data: { foodId: string; type: MealType; amount: number; date?: string }) {
    return this.mealService.logMeal(req.user.userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('daily')
  getDailyLogs(@Request() req, @Query('date') date: string) {
    return this.mealService.getDailyLogs(req.user.userId, date);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('item/:id')
  deleteMealItem(@Param('id') id: string) {
    return this.mealService.deleteMealItem(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('log-water')
  logWater(@Request() req, @Body('amount') amount: number) {
    return this.mealService.logWater(req.user.userId, amount);
  }
}
