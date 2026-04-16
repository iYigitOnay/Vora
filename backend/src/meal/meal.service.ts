import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MealType, FoodStatus } from '@prisma/client';

@Injectable()
export class MealService {
  constructor(private prisma: PrismaService) {}

  async logMeal(
    userId: string,
    data: {
      foodId?: string;
      foodData?: any; // Vision AI'dan gelen ham veri
      type: MealType;
      amount: number;
      date?: string;
      customName?: string;
      note?: string;
      consumeFromInventory?: boolean;
    },
  ) {
    const logDate = data.date ? new Date(data.date) : new Date();
    const startOfDay = new Date(logDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(logDate.setHours(23, 59, 59, 999));

    return this.prisma.$transaction(async (tx) => {
      const finalFoodId = data.foodId;

      if (!finalFoodId) throw new BadRequestException('Besin bilgisi eksik.');

      let meal = await tx.meal.findFirst({
        where: {
          userId,
          type: data.type,
          date: { gte: startOfDay, lte: endOfDay },
        },
      });

      if (!meal) {
        meal = await tx.meal.create({
          data: { userId, type: data.type, date: new Date() },
        });
      }

      let deducted = false;
      if (data.consumeFromInventory) {
        const inventoryItem = await tx.inventory.findFirst({
          where: { userId, foodId: finalFoodId },
        });

        if (inventoryItem) {
          await tx.inventory.update({
            where: { id: inventoryItem.id },
            data: { quantity: { decrement: data.amount } },
          });
          deducted = true;
        }
      }

      return tx.mealItem.create({
        data: {
          mealId: meal.id,
          foodId: finalFoodId,
          amount: data.amount,
          customName: data.customName || null,
          note: data.note || null,
          deductedFromInventory: deducted,
        },
        include: { food: true },
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
        items: { include: { food: true } },
      },
    });
  }

  async deleteMealItem(itemId: string) {
    return this.prisma.mealItem.delete({
      where: { id: itemId },
    });
  }

  async applyTemplate(
    userId: string,
    data: { templateId: string; type: MealType; date?: string },
  ) {
    const template = await this.prisma.mealTemplate.findUnique({
      where: { id: data.templateId },
      include: { items: true },
    });

    if (!template) throw new BadRequestException('Şablon bulunamadı.');

    const logDate = data.date ? new Date(data.date) : new Date();

    return this.prisma.$transaction(async (tx) => {
      const startOfDay = new Date(logDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(logDate);
      endOfDay.setHours(23, 59, 59, 999);

      let meal = await tx.meal.findFirst({
        where: {
          userId,
          type: data.type,
          date: { gte: startOfDay, lte: endOfDay },
        },
      });

      if (!meal) {
        meal = await tx.meal.create({
          data: { userId, type: data.type, date: logDate },
        });
      }

      const mealItems = template.items.map((item) => ({
        mealId: meal.id,
        foodId: item.foodId,
        amount: item.amount,
      }));

      return tx.mealItem.createMany({
        data: mealItems,
      });
    });
  }

  async logWater(userId: string, amount: number) {
    return this.prisma.waterLog.create({
      data: { userId, amount },
    });
  }

  async logManualMeal(userId: string, data: any) {
    return this.prisma.$transaction(async (tx) => {
      const food = await tx.food.create({
        data: {
          name: data.name,
          brand: data.brand || null,
          calories: Number(data.calories),
          protein: Number(data.protein) || 0,
          carbs: Number(data.carbs) || 0,
          fat: Number(data.fat) || 0,
          status: FoodStatus.PRIVATE,
          creatorId: userId,
        },
      });

      const logDate = new Date();
      const startOfDay = new Date(logDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(logDate.setHours(23, 59, 59, 999));

      let meal = await tx.meal.findFirst({
        where: {
          userId,
          type: data.type,
          date: { gte: startOfDay, lte: endOfDay },
        },
      });

      if (!meal) {
        meal = await tx.meal.create({
          data: { userId, type: data.type, date: new Date() },
        });
      }

      return tx.mealItem.create({
        data: {
          mealId: meal.id,
          foodId: food.id,
          amount: Number(data.amount),
          deductedFromInventory: data.consumeFromInventory || false,
        },
        include: { food: true },
      });
    });
  }
}
