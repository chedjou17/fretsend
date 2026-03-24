import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AgenciesService } from './agencies.service';
import { CreateAgencyDto } from './agencies.dto';
import { Public, CurrentUser, Roles } from '../common/decorators/index';

@ApiTags('Agencies')
@ApiBearerAuth('JWT')
@Controller({ path: 'agencies', version: '1' })
export class AgenciesController {
  constructor(private readonly agenciesService: AgenciesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Liste des agences (public)' })
  findAll(@Query('country') country?: string) { return this.agenciesService.findAll(country); }

  @Public()
  @Get(':id')
  findById(@Param('id') id: string) { return this.agenciesService.findById(id); }

  @Get(':id/stats')
  @Roles('admin', 'agency_manager')
  @ApiOperation({ summary: 'Statistiques d\'une agence' })
  getStats(@Param('id') id: string) { return this.agenciesService.getStats(id); }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Créer une agence (admin)' })
  create(@Body() dto: CreateAgencyDto) { return this.agenciesService.create(dto); }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: Partial<CreateAgencyDto>) { return this.agenciesService.update(id, dto); }

  @Patch(':id/toggle')
  @Roles('admin')
  @ApiOperation({ summary: 'Activer / désactiver une agence' })
  toggle(@Param('id') id: string) { return this.agenciesService.toggleActive(id); }
}
