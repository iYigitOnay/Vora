import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto'; // Birazdan oluşturacağız

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. E-posta kontrolü
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new ConflictException('Bu e-posta adresi zaten kullanımda.');
    }

    // 2. Şifre hashleme
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Kullanıcı ve Profil oluşturma (Transaction)
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        profile: {
          create: {
            firstName: dto.firstName,
            age: dto.age,
            gender: dto.gender,
            height: dto.height,
            weight: dto.weight,
            targetWeight: dto.targetWeight,
            activityLevel: dto.activityLevel,
            goal: dto.goal,
            selectedPersona: dto.selectedPersona || 'CHARCOAL',
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // 4. Token üretimi ve dönüş
    return this.generateTokens(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    return this.generateTokens(user.id, user.email);
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    
    // Access Token (15 dk) - Refresh token yapısını sonra genişletebiliriz
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    return {
      access_token: accessToken,
    };
  }
}
