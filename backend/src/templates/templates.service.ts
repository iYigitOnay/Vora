import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { Plan } from '@prisma/client';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.mealTemplate.findMany({
      where: { userId },
      include: {
        items: {
          include: { food: true },
        },
      },
    });
  }

  async create(userId: string, data: CreateTemplateDto) {
    // 1. Monetizasyon Kontrolü: Ücretsiz kullanıcı limiti
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (user?.plan === Plan.FREE) {
      const templateCount = await this.prisma.mealTemplate.count({
        where: { userId },
      });

      if (templateCount >= 2) {
        throw new ForbiddenException(
          "Ücretsiz planda en fazla 2 adet öğün şablonu oluşturabilirsiniz. Sınırsız şablon için Premium'a geçin.",
        );
      }
    }

    // 2. Şablon Oluşturma (Transaction ile)
    return this.prisma.mealTemplate.create({
      data: {
        userId,
        name: data.name,
        items: {
          create: data.items.map((item) => ({
            foodId: item.foodId,
            amount: item.amount,
          })),
        },
      },
      include: { items: { include: { food: true } } },
    });
  }

  async remove(userId: string, id: string) {
    const template = await this.prisma.mealTemplate.findFirst({
      where: { id, userId },
    });

    if (!template) throw new NotFoundException('Şablon bulunamadı.');

    return this.prisma.mealTemplate.delete({ where: { id } });
  }
}
