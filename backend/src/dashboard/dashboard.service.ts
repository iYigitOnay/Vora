import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private calculateTargets(profile: any) {
    let bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
    profile.gender === 'MALE' ? (bmr += 5) : (bmr -= 161);

    let activityMultiplier = 1.2;
    switch (profile.activityLevel) {
      case 'SEDENTARY': activityMultiplier = 1.2; break;
      case 'LIGHTLY_ACTIVE': activityMultiplier = 1.375; break;
      case 'MODERATELY_ACTIVE': activityMultiplier = 1.55; break;
      case 'VERY_ACTIVE': activityMultiplier = 1.725; break;
      case 'EXTRA_ACTIVE': activityMultiplier = 1.9; break;
    }

    const tdee = bmr * activityMultiplier;
    let targetCalories = tdee;
    if (profile.goal === 'LOSE_WEIGHT') targetCalories -= 500;
    else if (profile.goal === 'GAIN_WEIGHT') targetCalories += 500;
    targetCalories = Math.round(targetCalories);

    let targetWater = profile.weight * 35;
    if (profile.activityLevel === 'VERY_ACTIVE' || profile.activityLevel === 'EXTRA_ACTIVE') targetWater += 1000;
    else if (profile.activityLevel === 'MODERATELY_ACTIVE') targetWater += 500;
    targetWater = Math.round(targetWater);

    let pPct = 0.3, cPct = 0.4, fPct = 0.3;
    if (profile.goal === 'LOSE_WEIGHT') { pPct = 0.4; cPct = 0.3; fPct = 0.3; }
    else if (profile.goal === 'GAIN_WEIGHT') { pPct = 0.3; cPct = 0.5; fPct = 0.2; }

    const targetProtein = Math.round((targetCalories * pPct) / 4);
    const targetCarbs = Math.round((targetCalories * cPct) / 4);
    const targetFat = Math.round((targetCalories * fPct) / 9);

    return { bmr, tdee, targetCalories, targetProtein, targetCarbs, targetFat, targetWater };
  }

  async getSummary(userId: string, dateStr?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      throw new NotFoundException('Kullanıcı profili bulunamadı.');
    }

    const { profile } = user;
    const targets = this.calculateTargets(profile);

    let persona: string = profile.selectedPersona;
    const validPersonas = ['EMBER_MOSS', 'NEURAL_DARK', 'FORGE_MODE', 'AURA_LIGHT'];
    if (!validPersonas.includes(persona)) persona = 'EMBER_MOSS';

    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await this.prisma.meal.findMany({
      where: { userId, date: { gte: startOfDay, lte: endOfDay } },
      include: { items: { include: { food: true } } },
    });

    let consumedCalories = 0, consumedProtein = 0, consumedCarbs = 0, consumedFat = 0;

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
        calories: targets.targetCalories,
        protein: targets.targetProtein,
        carbs: targets.targetCarbs,
        fat: targets.targetFat,
        water: targets.targetWater,
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

  async getAnalysis(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) throw new NotFoundException('Profil bulunamadı.');

    const { profile } = user;
    const targets = this.calculateTargets(profile);

    // Son 7 günlük verileri çek
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const meals = await this.prisma.meal.findMany({
      where: { userId, date: { gte: sevenDaysAgo } },
      include: { items: { include: { food: true } } },
    });

    // 1. Kilo Tahminleme (Gerçek Performans Bazlı)
    const avgCalories7Days = meals.length > 0 
      ? Math.round(meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + (i.food.calories * i.amount / 100), 0), 0) / 7)
      : targets.targetCalories;

    const actualDailyDeficit = targets.tdee - avgCalories7Days;
    const weightDiff = Math.abs(profile.weight - profile.targetWeight);
    
    let weeksToGoal = 0;
    if (profile.goal === 'LOSE_WEIGHT' && actualDailyDeficit > 0) {
      weeksToGoal = (weightDiff * 7700) / (actualDailyDeficit * 7);
    } else if (profile.goal === 'GAIN_WEIGHT' && actualDailyDeficit < 0) {
      weeksToGoal = (weightDiff * 7700) / (Math.abs(actualDailyDeficit) * 7);
    }

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + Math.round(weeksToGoal * 7));

    // 2. Kilometre Taşları (Milestones)
    const dailyWeightChange = (actualDailyDeficit / 7700);
    const milestones = [
      { label: 'BAŞLANGIÇ', weight: profile.weight, date: new Date().toISOString() },
      { 
        label: '15 GÜN', 
        weight: Number((profile.weight - (dailyWeightChange * 15)).toFixed(1)), 
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() 
      },
      { 
        label: '30 GÜN', 
        weight: Number((profile.weight - (dailyWeightChange * 30)).toFixed(1)), 
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
      },
      { label: 'HEDEF', weight: profile.targetWeight, date: estimatedDate.toISOString() }
    ];

    // 3. Haftalık İstikrar (Fixing Date Logic)
    const consistency: any[] = [];
    let totalGoalsMet = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const s = new Date(d); s.setHours(0,0,0,0);
      const e = new Date(d); e.setHours(23,59,59,999);

      const dayMeals = meals.filter(m => {
        const mDate = new Date(m.date);
        return mDate >= s && mDate <= e;
      });

      const dayWater = await this.prisma.waterLog.findMany({
        where: { userId, date: { gte: s, lte: e } }
      });

      const dayCals = dayMeals.reduce((sum, m) => sum + m.items.reduce((s, it) => s + (it.food.calories * it.amount / 100), 0), 0);
      const dayProt = dayMeals.reduce((sum, m) => sum + m.items.reduce((s, it) => s + (it.food.protein * it.amount / 100), 0), 0);
      const dayWaterAmt = dayWater.reduce((sum, w) => sum + w.amount, 0);

      const calMet = profile.goal === 'LOSE_WEIGHT' ? (dayCals > 0 && dayCals <= targets.targetCalories + 100) : (dayCals >= targets.targetCalories - 100);
      const waterMet = dayWaterAmt >= (targets.targetWater * 0.8);
      const proteinMet = dayProt >= (targets.targetProtein * 0.8);

      if (calMet) totalGoalsMet++;
      if (waterMet) totalGoalsMet++;
      if (proteinMet) totalGoalsMet++;

      consistency.push({
        date: d.toISOString(),
        calMet,
        waterMet,
        proteinMet
      });
    }

    // 4. Öğün Dağılımı (RE-CALCULATED)
    const distribution = { BREAKFAST: 0, LUNCH: 0, DINNER: 0, SNACK: 0 };
    meals.forEach(m => {
      const mealCals = m.items.reduce((sum, i) => sum + (i.food.calories * i.amount / 100), 0);
      distribution[m.type] += mealCals;
    });

    return {
      projection: {
        currentWeight: profile.weight,
        targetWeight: profile.targetWeight,
        weeksRemaining: Number(weeksToGoal.toFixed(1)),
        estimatedDate: estimatedDate.toISOString(),
        dailyDeficit: Math.round(actualDailyDeficit),
        bmr: Math.round(targets.bmr),
        tdee: Math.round(targets.tdee)
      },
      consistency,
      weeklyScore: Math.round((totalGoalsMet / 21) * 100),
      milestones,
      mealDistribution: distribution,
      summary7Days: {
        avgCalories: Math.round(meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + (i.food.calories * i.amount / 100), 0), 0) / 7)
      }
    };
  }
}
