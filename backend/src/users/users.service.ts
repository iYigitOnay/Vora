import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Persona } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updatePersona(userId: string, persona: Persona) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Kullanıcı profili bulunamadı.');
    }

    return this.prisma.profile.update({
      where: { userId },
      data: { selectedPersona: persona },
    });
  }
}
