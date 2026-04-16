import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FoodModule } from './food/food.module';
import { MealModule } from './meal/meal.module';
import { InventoryModule } from './inventory/inventory.module';
import { TemplatesModule } from './templates/templates.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'backend/.env', '../backend/.env'], // Birden fazla olasılığı dene
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DashboardModule,
    FoodModule,
    MealModule,
    InventoryModule,
    TemplatesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
