import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PackagesService } from './packages.service';
import { CreatePackageDto, UpdateStatusDto, PackageQueryDto } from './packages.dto';
import { Public, CurrentUser, Roles } from '../common/decorators/index';

@ApiTags('Packages')
@ApiBearerAuth('JWT')
@Controller({ path: 'packages', version: '1' })
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  // GET /api/v1/packages — Liste paginée avec filtres
  @Get()
  @Roles('admin', 'agency_manager', 'agent', 'client')
  @ApiOperation({ summary: 'Liste des colis avec filtres et pagination' })
  findAll(
    @Query()              query:     PackageQueryDto,
    @CurrentUser('id')    userId:    string,
    @CurrentUser('role')  role:      string,
    @CurrentUser('agency_id') agencyId: string,
  ) {
    return this.packagesService.findAll(query, userId, role, agencyId);
  }

  // GET /api/v1/packages/stats
  @Get('stats')
  @Roles('admin', 'agency_manager', 'agent')
  @ApiOperation({ summary: 'Statistiques des colis (scope selon rôle)' })
  getStats(
    @CurrentUser('role')      role:     string,
    @CurrentUser('agency_id') agencyId: string,
  ) {
    return this.packagesService.getStats(role, agencyId);
  }

  // GET /api/v1/packages/track/:trackingNumber — SANS AUTH
  @Public()
  @Get('track/:trackingNumber')
  @ApiOperation({ summary: 'Suivi public d\'un colis — sans authentification' })
  @ApiParam({ name: 'trackingNumber', example: 'FS-FR-20250315-00042' })
  trackPublic(@Param('trackingNumber') trackingNumber: string) {
    return this.packagesService.findByTracking(trackingNumber);
  }

  // GET /api/v1/packages/:id
  @Get(':id')
  @Roles('admin', 'agency_manager', 'agent', 'client')
  @ApiOperation({ summary: 'Détail d\'un colis par ID' })
  findById(
    @Param('id')          id:     string,
    @CurrentUser('id')    userId: string,
    @CurrentUser('role')  role:   string,
  ) {
    return this.packagesService.findById(id, userId, role);
  }

  // POST /api/v1/packages — Créer un colis
  @Post()
  @Roles('admin', 'agency_manager', 'agent')
  @ApiOperation({ summary: 'Créer un nouveau colis' })
  create(
    @Body()            dto:    CreatePackageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.packagesService.create(dto, userId);
  }

  // PATCH /api/v1/packages/:id/status — Mettre à jour le statut
  @Patch(':id/status')
  @Roles('admin', 'agency_manager', 'agent')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un colis' })
  updateStatus(
    @Param('id')       id:     string,
    @Body()            dto:    UpdateStatusDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.packagesService.updateStatus(id, dto, userId);
  }
}

  // GET /api/v1/users/check?email=... (client lookup)
