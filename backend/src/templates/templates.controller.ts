import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTemplateDto } from './dto/create-template.dto';

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  findAll(@Request() req) {
    return this.templatesService.findAll(req.user.userId);
  }

  @Post()
  create(@Request() req, @Body() data: CreateTemplateDto) {
    return this.templatesService.create(req.user.userId, data);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.templatesService.remove(req.user.userId, id);
  }
}
