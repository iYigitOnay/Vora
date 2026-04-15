import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string, dateStr?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      throw new NotFoundException('Kullanıcı profili bulunamadı.');
    }

    const { profile } = user;

    // ... (Persona ve BMR hesaplamaları aynı kalacak) ...

    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(targetDate); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate); endOfDay.setHours(23, 59, 59, 999);

    const meals = await this.prisma.meal.findMany({
      where: { userId, date: { gte: startOfDay, lte: endOfDay } },
      include: { items: { include: { food: true } } }
    });

    // ... (consumed hesaplamaları aynı kalacak) ...

    const waterLogs = await this.prisma.waterLog.findMany({
      where: { userId, date: { gte: startOfDay, lte: endOfDay } }
    });
    const consumedWater = waterLogs.reduce((sum, log) => sum + log.amount, 0);

    return {
      user: { firstName: profile.firstName, persona, goal: profile.goal },
      targets: { calories: targetCalories, protein: targetProtein, carbs: targetCarbs, fat: targetFat, water: targetWater },
      consumed: { calories: Math.round(consumedCalories), protein: Math.round(consumedProtein), carbs: Math.round(consumedCarbs), fat: Math.round(consumedFat), water: consumedWater },
      auraStreak: 12
    };
  }
}
