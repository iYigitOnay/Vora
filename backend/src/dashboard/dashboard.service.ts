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

    let persona: string = profile.selectedPersona;
    const validPersonas = [
      'EMBER_MOSS',
      'NEURAL_DARK',
      'FORGE_MODE',
      'AURA_LIGHT',
    ];
    if (!validPersonas.includes(persona)) persona = 'EMBER_MOSS';

    let bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
    profile.gender === 'MALE' ? (bmr += 5) : (bmr -= 161);

    let activityMultiplier = 1.2;
    switch (profile.activityLevel) {
      case 'SEDENTARY':
        activityMultiplier = 1.2;
        break;
      case 'LIGHTLY_ACTIVE':
        activityMultiplier = 1.375;
        break;
      case 'MODERATELY_ACTIVE':
        activityMultiplier = 1.55;
        break;
      case 'VERY_ACTIVE':
        activityMultiplier = 1.725;
        break;
      case 'EXTRA_ACTIVE':
        activityMultiplier = 1.9;
        break;
    }

    const tdee = bmr * activityMultiplier;
    let targetCalories = tdee;
    if (profile.goal === 'LOSE_WEIGHT') targetCalories -= 500;
    else if (profile.goal === 'GAIN_WEIGHT') targetCalories += 500;
    targetCalories = Math.round(targetCalories);

    let targetWater = profile.weight * 35;
    if (
      profile.activityLevel === 'VERY_ACTIVE' ||
      profile.activityLevel === 'EXTRA_ACTIVE'
    )
      targetWater += 1000;
    else if (profile.activityLevel === 'MODERATELY_ACTIVE') targetWater += 500;
    targetWater = Math.round(targetWater);

    let pPct = 0.3,
      cPct = 0.4,
      fPct = 0.3;
    if (profile.goal === 'LOSE_WEIGHT') {
      pPct = 0.4;
      cPct = 0.3;
      fPct = 0.3;
    } else if (profile.goal === 'GAIN_WEIGHT') {
      pPct = 0.3;
      cPct = 0.5;
      fPct = 0.2;
    }

    const targetProtein = Math.round((targetCalories * pPct) / 4);
    const targetCarbs = Math.round((targetCalories * cPct) / 4);
    const targetFat = Math.round((targetCalories * fPct) / 9);

    // --- Tarih Fix Mantığı ---
    // dateStr formatı: 2026-04-15
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await this.prisma.meal.findMany({
      where: { userId, date: { gte: startOfDay, lte: endOfDay } },
      include: { items: { include: { food: true } } },
    });

    let consumedCalories = 0,
      consumedProtein = 0,
      consumedCarbs = 0,
      consumedFat = 0;

    meals.forEach((meal) => {
      meal.items.forEach((item) => {
        const ratio = item.amount / 100;
        consumedCalories += item.food.calories * ratio;
        consumedProtein += item.food.protein * ratio;
        consumedCarbs += item.food.carbs * ratio;
        consumedFat += item.food.fat * ratio;
      });
    });

    const waterLogs = await this.prisma.waterLog.findMany({
      where: { userId, date: { gte: startOfDay, lte: endOfDay } },
    });
    const consumedWater = waterLogs.reduce((sum, log) => sum + log.amount, 0);

    return {
      user: { firstName: profile.firstName, persona, goal: profile.goal },
      targets: {
        calories: targetCalories,
        protein: targetProtein,
        carbs: targetCarbs,
        fat: targetFat,
        water: targetWater,
      },
      consumed: {
        calories: Math.round(consumedCalories),
        protein: Math.round(consumedProtein),
        carbs: Math.round(consumedCarbs),
        fat: Math.round(consumedFat),
        water: consumedWater,
      },
      auraStreak: 12,
    };
  }
}
