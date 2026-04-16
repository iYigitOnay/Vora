import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { FoodStatus } from '@prisma/client';
import * as Jimp from 'jimp';
import barcodeReader from 'javascript-barcode-reader';

@Injectable()
export class FoodService {
  private readonly logger = new Logger(FoodService.name);

  constructor(private prisma: PrismaService) {}

  async scanBarcode(barcode: string, userId: string) {
    const existing = await this.prisma.food.findUnique({
      where: { barcode },
    });

    if (existing) {
      if (
        existing.status === FoodStatus.PRIVATE &&
        existing.creatorId !== userId
      ) {
        this.logger.warn(
          `Gizli ürüne (PRIVATE) yetkisiz barkod erişimi engellendi: ${barcode}`,
        );
      } else {
        return existing;
      }
    }

    try {
      const response = await axios.get(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
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
        status: FoodStatus.VERIFIED,
        creatorId: userId,
      };

      return await this.prisma.food.upsert({
        where: { barcode: barcode },
        update: foodData,
        create: foodData,
      });
    } catch (error) {
      if (error.response?.status === 404 || error instanceof NotFoundException) {
        throw new NotFoundException('Ürün kütüphanede bulunamadı.');
      }
      throw new Error(`Ürün sorgulama sırasında bir sorun oluştu.`);
    }
  }

  async analyzeImage(file: any, userId: string) {
    if (!file) throw new BadRequestException('Görsel dosyası eksik.');

    try {
      // 1. Görseli Jimp ile oku
      const image = await Jimp.read(file.buffer);
      
      // 2. Profesyonel Önişleme (Thresholding Barkod için hayat kurtarır)
      // Resmi gri yap, kontrastı artır ve 1000px genişliğe sabitle (daha hızlı ve doğru analiz için)
      if (image.bitmap.width > 1000) {
        image.resize(1000, Jimp.AUTO);
      }
      
      image.grayscale().contrast(0.5).normalize();

      // 3. Barkodu tüm formatlarda tara
      const result = await (barcodeReader as any)({
        image: image.bitmap.data,
        width: image.bitmap.width,
        height: image.bitmap.height,
        barcode: 'all', // Tüm standartları dene (EAN, UPC, Code128 vb.)
        options: {
          useBoxDetection: true, // Barkodun etrafındaki kutuyu bulmaya çalış
        }
      });

      if (!result) {
        // Eğer ilk denemede bulamadıysa, resmi biraz daha keskinleştirip tekrar dene (Fallback)
        image.contrast(0.8).posterize(2); 
        const retryResult = await (barcodeReader as any)({
          image: image.bitmap.data,
          width: image.bitmap.width,
          height: image.bitmap.height,
          barcode: 'all'
        });

        if (!retryResult) {
          throw new NotFoundException('Görselde geçerli bir barkod tanımlanamadı.');
        }
        return await this.scanBarcode(retryResult, userId);
      }

      this.logger.log(`Barkod başarıyla okundu: ${result}`);

      // 4. Bulunan barkodu mevcut scanBarcode sistemiyle sorgula
      return await this.scanBarcode(result, userId);
    } catch (error) {
      this.logger.error(`Vision Engine Hatası: ${error.message}`);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Fotoğraf analiz edilirken bir hata oluştu veya barkod okunamadı.');
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
              { status: FoodStatus.VERIFIED },
              { status: FoodStatus.COMMUNITY },
              { AND: [{ status: FoodStatus.PRIVATE }, { creatorId: userId }] },
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
        status: FoodStatus.PRIVATE,
      },
    });
  }
}
