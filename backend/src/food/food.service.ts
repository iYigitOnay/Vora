import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { FoodStatus } from '@prisma/client';

@Injectable()
export class FoodService {
  private readonly logger = new Logger(FoodService.name);

  constructor(private prisma: PrismaService) {}

  async scanBarcode(barcode: string, userId: string) {
    // 1. Önce kendi DB'mizde resmi veri var mı bak
    const existing = await this.prisma.food.findUnique({
      where: { barcode },
    });

    if (existing) {
      // Katı Gizlilik: Eğer ürün PRIVATE ise ve taratan kişi creator değilse, DB'dekini YOK SAY.
      if (existing.status === FoodStatus.PRIVATE && existing.creatorId !== userId) {
        this.logger.warn(`Gizli ürüne (PRIVATE) yetkisiz barkod erişimi engellendi: ${barcode}`);
      } else {
        return existing;
      }
    }

    // 2. Yoksa dış API'den çek ve VERIFIED olarak kaydet
    try {
      const response = await axios.get(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
      );

      if (response.data.status === 0 || !response.data.product) {
        throw new NotFoundException('Ürün kütüphanede bulunamadı.');
      }

      const product = response.data.product;
      const nutriments = product.nutriments || {};

      const foodData = {
        name: product.product_name || 'Bilinmeyen Ürün',
        brand: product.brands || '',
        calories: Number(nutriments['energy-kcal_100g']) || 0,
        protein: Number(nutriments.proteins_100g) || Number(nutriments.protein_100g) || 0,
        carbs: Number(nutriments.carbohydrates_100g) || 0,
        fat: Number(nutriments.fat_100g) || 0,
        defaultAmount: Number(product.product_quantity) || 100,
        barcode: barcode,
        image: product.image_url || '',
        status: FoodStatus.VERIFIED, // RESMİ VERİ
        creatorId: userId,
      };

      return await this.prisma.food.create({ data: foodData });
    } catch (error) {
      if (error.response?.status === 404 || error instanceof NotFoundException) {
        throw new NotFoundException('Ürün kütüphanede bulunamadı.');
      }
      throw new Error(`Ürün sorgulama sırasında bir sorun oluştu.`);
    }
  }

  async search(query: string, userId: string) {
    return this.prisma.food.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { brand: { contains: query, mode: 'insensitive' } },
            ],
          },
          {
            OR: [
              { status: FoodStatus.VERIFIED }, // Resmi verileri herkes görür
              { status: FoodStatus.COMMUNITY }, // Topluluk verilerini herkes görür
              { AND: [{ status: FoodStatus.PRIVATE }, { creatorId: userId }] }, // Özelleri SADECE sahibi görür
            ],
          },
        ],
      },
      take: 20,
      orderBy: { status: 'asc' },
    });
  }

  async createManual(data: any, userId: string) {
    return this.prisma.food.create({
      data: {
        name: data.name,
        brand: data.brand,
        calories: Number(data.calories),
        protein: Number(data.protein),
        carbs: Number(data.carbs),
        fat: Number(data.fat),
        defaultAmount: Number(data.defaultAmount) || 100,
        creatorId: userId,
        status: FoodStatus.PRIVATE, // MANUEL GİRİŞ ÖZELDİR
      },
    });
  }
}
