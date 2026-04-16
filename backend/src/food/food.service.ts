import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { FoodStatus } from '@prisma/client';
import sharp from 'sharp';
import { 
  MultiFormatReader, 
  BinaryBitmap, 
  HybridBinarizer, 
  RGBLuminanceSource, 
  DecodeHintType,
  BarcodeFormat
} from '@zxing/library';

@Injectable()
export class FoodService {
  private readonly logger = new Logger(FoodService.name);
  private readonly reader: MultiFormatReader;

  constructor(private prisma: PrismaService) {
    this.reader = new MultiFormatReader();
    // Tüm formatları (EAN, UPC, QR vb.) taraması için ipucu veriyoruz
    const hints = new Map();
    const formats = [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.QR_CODE
    ];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    hints.set(DecodeHintType.TRY_HARDER, true);
    this.reader.setHints(hints);
  }

  async scanBarcode(barcode: string, userId: string) {
    const existing = await this.prisma.food.findUnique({ where: { barcode } });

    if (existing) {
      if (existing.status === FoodStatus.PRIVATE && existing.creatorId !== userId) {
        this.logger.warn(`Gizli ürüne erişim engellendi: ${barcode}`);
      } else {
        return existing;
      }
    }

    try {
      const response = await axios.get(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      if (response.data.status === 0 || !response.data.product) {
        throw new NotFoundException('Ürün bulunamadı.');
      }

      const p = response.data.product;
      const n = p.nutriments || {};

      const foodData = {
        name: p.product_name || 'Bilinmeyen Ürün',
        brand: p.brands || '',
        calories: Number(n['energy-kcal_100g']) || 0,
        protein: Number(n.proteins_100g) || 0,
        carbs: Number(n.carbohydrates_100g) || 0,
        fat: Number(n.fat_100g) || 0,
        defaultAmount: Number(p.product_quantity) || 100,
        barcode: barcode,
        image: p.image_url || '',
        status: FoodStatus.VERIFIED,
        creatorId: userId,
      };

      return await this.prisma.food.upsert({
        where: { barcode },
        update: foodData,
        create: foodData,
      });
    } catch (error) {
      throw new NotFoundException('Gıda veritabanında ürün bulunamadı.');
    }
  }

  async analyzeImage(file: any, userId: string) {
    if (!file) throw new BadRequestException('Görsel dosyası eksik.');

    try {
      // 1. Sharp ile profesyonel önişleme
      const { data, info } = await sharp(file.buffer)
        .grayscale() // Siyah-beyaz yap
        .normalize() // Kontrastı optimize et
        .threshold(128) // Barkod çizgilerini keskinleştir
        .raw()
        .toBuffer({ resolveWithObject: true });

      // 2. ZXing formatına çevir
      const luminanceSource = new RGBLuminanceSource(
        new Uint8ClampedArray(data),
        info.width,
        info.height
      );
      const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

      // 3. Barkodu oku
      const result = this.reader.decode(binaryBitmap);
      const barcodeText = result.getText();

      this.logger.log(`Master Vision Engine: Barkod yakalandı -> ${barcodeText}`);

      // 4. Mevcut sistemle sorgula
      return await this.scanBarcode(barcodeText, userId);
    } catch (error) {
      this.logger.error(`Vision Engine Hatası: ${error.message}`);
      throw new NotFoundException('Görselde okunabilir bir barkod bulunamadı.');
    }
  }

  async search(query: string, userId: string) {
    return this.prisma.food.findMany({
      where: {
        AND: [
          { OR: [{ name: { contains: query, mode: 'insensitive' } }, { brand: { contains: query, mode: 'insensitive' } }] },
          { OR: [{ status: FoodStatus.VERIFIED }, { status: FoodStatus.COMMUNITY }, { AND: [{ status: FoodStatus.PRIVATE }, { creatorId: userId }] }] }
        ]
      },
      take: 20
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
        creatorId: userId,
        status: FoodStatus.PRIVATE,
      },
    });
  }
}
