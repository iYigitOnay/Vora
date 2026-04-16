import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async checkEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return { exists: !!user };
  }

  async register(dto: RegisterDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new ConflictException('Bu e-posta adresi zaten kullanımda.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 dk geçerli

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        isVerified: false,
        verificationCode,
        codeExpiresAt: expiresAt,
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
            selectedPersona: dto.selectedPersona || 'EMBER_MOSS',
          },
        },
      },
    });

    // Mail gönderimi (Asenkron - kullanıcı bekletilmemeli)
    console.log(`[DEBUG] Verification code for ${user.email}: ${verificationCode}`);
    this.mailService
      .sendVerificationEmail(user.email, verificationCode)
      .catch((err) => {
        console.error('Mail gönderilemedi ama kullanıcı oluşturuldu:', err);
      });

    return {
      message: 'Kayıt başarılı. Lütfen e-postanıza gönderilen doğrulama kodunu girin.',
      email: user.email,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Lütfen önce e-posta adresinizi doğrulayın.',
      );
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.verificationCode !== code) {
      throw new UnauthorizedException('Geçersiz doğrulama kodu.');
    }

    if (!user.codeExpiresAt || user.codeExpiresAt < new Date()) {
      throw new UnauthorizedException('Doğrulama kodunun süresi dolmuş.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        codeExpiresAt: null,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return {
      message: 'E-posta başarıyla doğrulandı.',
      ...tokens,
    };
  }

  async resendVerificationCode(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new UnauthorizedException('Kullanıcı bulunamadı.');
    if (user.isVerified)
      throw new ConflictException('Bu e-posta zaten doğrulanmış.');

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    console.log(`[DEBUG] New verification code for ${email}: ${verificationCode}`);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationCode, codeExpiresAt: expiresAt },
    });

    // Mail gönderimi (Asenkron - kullanıcı bekletilmemeli)
    this.mailService
      .sendVerificationEmail(email, verificationCode)
      .catch((err) => {
        console.error('Yeni mail gönderilemedi:', err.message);
      });

    return { message: 'Yeni doğrulama kodu gönderildi.' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user)
      return { message: 'Eğer hesap mevcutsa sıfırlama kodu gönderilecektir.' };

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordCode: resetCode, codeExpiresAt: expiresAt },
    });

    await this.mailService.sendPasswordResetEmail(email, resetCode);
    return { message: 'Şifre sıfırlama kodu gönderildi.' };
  }

  async resetPassword(email: string, code: string, newPassword: Buffer) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.resetPasswordCode !== code) {
      throw new UnauthorizedException('Geçersiz sıfırlama kodu.');
    }

    if (!user.codeExpiresAt || user.codeExpiresAt < new Date()) {
      throw new UnauthorizedException('Sıfırlama kodunun süresi dolmuş.');
    }

    const hashedPassword = await bcrypt.hash(newPassword.toString(), 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordCode: null,
        codeExpiresAt: null,
      },
    });

    return { message: 'Şifreniz başarıyla güncellendi.' };
  }

  async logout(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Erişim reddedildi.');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Erişim reddedildi.');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m', // Access token kısa süreli
      }),
      this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'refresh-secret-vora-2026',
        expiresIn: '30d', // Refresh token uzun süreli
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
