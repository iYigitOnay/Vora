import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class FoodService {
  constructor(private prisma: PrismaService) {}

  async scanBarcode(barcode: string) {
    // 1. Önce bizim DB'de var mı bak
    const existingFood = await this.prisma.food.findUnique({
      where: { barcode },
    });

    if (existingFood) return existingFood;

    // 2. Yoksa Open Food Facts API'sine sor
    try {
      const response = await axios.get(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
      );

      if (response.data.status === 0) {
        throw new NotFoundException('Ürün bulunamadı.');
      }

      const product = response.data.product;
      const nutriments = product.nutriments;

      // Veriyi bizim formata çevir (100g/ml başına)
      const foodData = {
        name: product.product_name || 'Bilinmeyen Ürün',
        brand: product.brands || '',
        calories: nutriments['energy-kcal_100g'] || 0,
        protein: nutriments.protein_100g || 0,
        carbs: nutriments.carbohydrates_100g || 0,
        fat: nutriments.fat_100g || 0,
        barcode: barcode,
        image: product.image_url || '',
        isGlobal: true,
      };

      // Yeni ürünü DB'ye kaydet ki bir sonrakinde hızlı gelsin
      return await this.prisma.food.create({ data: foodData });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error('Ürün sorgulama sırasında bir hata oluştu.');
    }
  }

  async search(query: string) {
    return this.prisma.food.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
    });
  }

  async createManual(data: any) {
    return this.prisma.food.create({
      data: {
        ...data,
        isGlobal: false, // Kullanıcıya özel
      },
    });
  }
}
