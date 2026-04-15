<<<<<<< HEAD
import { Controller, Get, Request, UseGuards, Query } from '@nestjs/common';
=======
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
>>>>>>> 0f7393460c8646794544f79c054607f1ee9ab49c
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  getSummary(@Request() req, @Query('date') date?: string) {
    return this.dashboardService.getSummary(req.user.userId, date);
  }
}
