import { Controller, Get, Request, UseGuards, Query } from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Get('analysis')
  getAnalysis(@Request() req) {
    return this.dashboardService.getAnalysis(req.user.userId);
  }
}
