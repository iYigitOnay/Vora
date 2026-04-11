import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MealType } from '@prisma/client';

@Injectable()
export class MealService {
  constructor(private prisma: PrismaService) {}

  async logMeal(userId: string, data: { 
    foodId: string; 
    type: MealType; 
    amount: number; 
    date?: string;
    customName?: string;
    note?: string;
  }) {
    const logDate = data.date ? new Date(data.date) : new Date();
    const startOfDay = new Date(logDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(logDate.setHours(23, 59, 59, 999));

    return this.prisma.$transaction(async (tx) => {
      // 1. O gün için bu tipte bir Meal var mı bak, yoksa oluştur (Atomik)
      let meal = await tx.meal.findFirst({
        where: {
          userId,
          type: data.type,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (!meal) {
        meal = await tx.meal.create({
          data: {
            userId,
            type: data.type,
            date: new Date(), // Orijinal kayıt zamanı
          },
        });
      }

      // 2. MealItem'ı ekle (customName ve note ile birlikte)
      return tx.mealItem.create({
        data: {
          mealId: meal.id,
          foodId: data.foodId,
          amount: data.amount,
          customName: data.customName || null,
          note: data.note || null,
        },
        include: {
          food: true,
        },
      });
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
