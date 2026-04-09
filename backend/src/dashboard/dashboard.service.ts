import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      throw new NotFoundException('Kullanıcı profili bulunamadı.');
    }

    const { profile } = user;

    // 1. Mifflin-St Jeor formülü ile BMR hesaplama
    let bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age);
    if (profile.gender === 'MALE') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // 2. Aktivite Çarpanı ile TDEE (Total Daily Energy Expenditure) hesaplama
    let activityMultiplier = 1.2; // SEDENTARY
    switch (profile.activityLevel) {
      case 'SEDENTARY': activityMultiplier = 1.2; break;
      case 'LIGHTLY_ACTIVE': activityMultiplier = 1.375; break;
      case 'MODERATELY_ACTIVE': activityMultiplier = 1.55; break;
      case 'VERY_ACTIVE': activityMultiplier = 1.725; break;
      case 'EXTRA_ACTIVE': activityMultiplier = 1.9; break;
    }

    const tdee = bmr * activityMultiplier;

    // 3. Hedefe göre günlük kalori ihtiyacı
    let targetCalories = tdee;
    if (profile.goal === 'LOSE_WEIGHT') {
      targetCalories -= 500;
    } else if (profile.goal === 'GAIN_WEIGHT') {
      targetCalories += 500;
    }
    
    targetCalories = Math.round(targetCalories);

    // 4. Dinamik Su Hedefi Hesaplama (Kilo * 35ml + Hava Durumu -Opsiyonel-)
    // Şimdilik hava durumunu frontend'den parametre olarak alabiliriz veya 
    // temel bilimsel formülü kurup üzerine ekleme yapabiliriz.
    let targetWater = profile.weight * 35; // Temel ihtiyaç
    
    // Antrenman varsa ekle
    if (profile.activityLevel === 'VERY_ACTIVE' || profile.activityLevel === 'EXTRA_ACTIVE') {
      targetWater += 1000; // Yoğun günlerde +1L
    } else if (profile.activityLevel === 'MODERATELY_ACTIVE') {
      targetWater += 500; // Aktif günlerde +500ml
    }

    targetWater = Math.round(targetWater);

    // 5. Makro Hesaplamaları
    let pPct = 0.3, cPct = 0.4, fPct = 0.3; // MAINTAIN_WEIGHT default
    if (profile.goal === 'LOSE_WEIGHT') {
      pPct = 0.4; cPct = 0.3; fPct = 0.3; // Yüksek protein, düşük karb
    } else if (profile.goal === 'GAIN_WEIGHT') {
      pPct = 0.3; cPct = 0.5; fPct = 0.2; // Yüksek karb, düşük yağ
    }

    const targetProtein = Math.round((targetCalories * pPct) / 4); // 1g Protein = 4 kcal
    const targetCarbs = Math.round((targetCalories * cPct) / 4);   // 1g Karb = 4 kcal
    const targetFat = Math.round((targetCalories * fPct) / 9);     // 1g Yağ = 9 kcal

    // 5. Günlük Tüketimleri (MealItems & WaterLogs) çek
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const meals = await this.prisma.meal.findMany({
      where: { 
        userId,
        date: { gte: todayStart, lte: todayEnd }
      },
      include: {
        items: { include: { food: true } }
      }
    });

    let consumedCalories = 0;
    let consumedProtein = 0;
    let consumedCarbs = 0;
    let consumedFat = 0;

    meals.forEach(meal => {
      meal.items.forEach(item => {
        // Formül: (Food degeri / 100) * Tüketilen miktar
        const ratio = item.amount / 100;
        consumedCalories += item.food.calories * ratio;
        consumedProtein += item.food.protein * ratio;
        consumedCarbs += item.food.carbs * ratio;
        consumedFat += item.food.fat * ratio;
      });
    });

    const waterLogs = await this.prisma.waterLog.findMany({
      where: {
        userId,
        date: { gte: todayStart, lte: todayEnd }
      }
    });

    const consumedWater = waterLogs.reduce((sum, log) => sum + log.amount, 0);

    return {
      user: {
        firstName: profile.firstName,
        persona: profile.selectedPersona,
        goal: profile.goal,
      },
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
      auraStreak: 12 // TODO: Gelecekte ardışık günlerden hesaplanacak
    };
  }
}
