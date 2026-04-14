import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(@Request() req) {
    return this.inventoryService.findAll(req.user.userId);
  }

  @Post()
  create(@Request() req, @Body() data: CreateInventoryDto) {
    return this.inventoryService.create(req.user.userId, data);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() data: UpdateInventoryDto) {
    return this.inventoryService.update(req.user.userId, id, data);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.inventoryService.remove(req.user.userId, id);
  }

  @Get('alerts')
  getAlerts(@Request() req) {
    return this.inventoryService.checkThresholds(req.user.userId);
  }
}
