import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.inventory.findMany({
      where: { userId },
      include: {
        food: {
          select: {
            name: true,
            brand: true,
            calories: true,
            protein: true,
            carbs: true,
            fat: true,
            image: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(userId: string, data: CreateInventoryDto) {
    // Eğer aynı ürün zaten kilerde varsa miktarını artır, yoksa yeni oluştur (Upsert mantığı)
    const existing = await this.prisma.inventory.findFirst({
      where: { userId, foodId: data.foodId },
    });

    if (existing) {
      return this.prisma.inventory.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + data.quantity,
          minLimit: data.minLimit ?? existing.minLimit,
        },
      });
    }

    return this.prisma.inventory.create({
      data: {
        userId,
        foodId: data.foodId,
        quantity: data.quantity,
        unit: data.unit || 'g',
        minLimit: data.minLimit,
      },
      include: {
        food: {
          select: {
            name: true,
            brand: true,
            calories: true,
            protein: true,
            carbs: true,
            fat: true,
            image: true,
          },
        },
      },
    });
  }

  async update(userId: string, id: string, data: UpdateInventoryDto) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { id, userId },
    });

    if (!inventory) throw new NotFoundException('Kiler ürünü bulunamadı.');

    return this.prisma.inventory.update({
      where: { id },
      data,
      include: {
        food: {
          select: {
            name: true,
            brand: true,
            calories: true,
            protein: true,
            carbs: true,
            fat: true,
            image: true,
          },
        },
      },
    });
  }

  async remove(userId: string, id: string) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { id, userId },
    });

    if (!inventory) throw new NotFoundException('Kiler ürünü bulunamadı.');

    return this.prisma.inventory.delete({ where: { id } });
  }

  // Akıllı Stok Kontrolü (Gelecekte bildirimler için kullanılacak)
  async checkThresholds(userId: string) {
    const criticalItems = await this.prisma.inventory.findMany({
      where: {
        userId,
        minLimit: { not: null },
      },
      include: { food: { select: { name: true } } },
    });

    return criticalItems.filter(item => item.quantity <= (item.minLimit || 0));
  }
}
