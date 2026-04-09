import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MealType } from '@prisma/client';

@Injectable()
export class MealService {
  constructor(private prisma: PrismaService) {}

  async logMeal(userId: string, data: { foodId: string; type: MealType; amount: number; date?: string }) {
    const logDate = data.date ? new Date(data.date) : new Date();
    
    // 1. O gün için bu tipte bir Meal var mı bak, yoksa oluştur
    let meal = await this.prisma.meal.findFirst({
      where: {
        userId,
        type: data.type,
        date: {
          gte: new Date(logDate.setHours(0, 0, 0, 0)),
          lte: new Date(logDate.setHours(23, 59, 59, 999)),
        },
      },
    });

    if (!meal) {
      meal = await this.prisma.meal.create({
        data: {
          userId,
          type: data.type,
          date: new Date(),
        },
      });
    }

    // 2. MealItem'ı ekle
    return this.prisma.mealItem.create({
      data: {
        mealId: meal.id,
        foodId: data.foodId,
        amount: data.amount,
      },
      include: {
        food: true,
      },
    });
  }

  async getDailyLogs(userId: string, date: string) {
    const queryDate = new Date(date);
    return this.prisma.meal.findMany({
      where: {
        userId,
        date: {
          gte: new Date(queryDate.setHours(0, 0, 0, 0)),
          lte: new Date(queryDate.setHours(23, 59, 59, 999)),
        },
      },
      include: {
        items: {
          include: { food: true },
        },
      },
    });
  }

  async deleteMealItem(itemId: string) {
    return this.prisma.mealItem.delete({
      where: { id: itemId },
    });
  }

  async logWater(userId: string, amount: number) {
    return this.prisma.waterLog.create({
      data: {
        userId,
        amount,
      },
    });
  }
}
