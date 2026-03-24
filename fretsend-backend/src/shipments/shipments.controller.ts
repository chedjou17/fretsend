import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './shipments.dto';
import { CurrentUser, Roles } from '../common/decorators/index';

@ApiTags('Shipments')
@ApiBearerAuth('JWT')
@Controller({ path: 'shipments', version: '1' })
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Get()
  @Roles('admin','agency_manager','agent')
  @ApiOperation({ summary: 'Liste des expéditions' })
  findAll() { return this.shipmentsService.findAll(); }

  @Get(':id')
  @Roles('admin','agency_manager','agent')
  findById(@Param('id') id: string) { return this.shipmentsService.findById(id); }

  @Post()
  @Roles('admin','agency_manager')
  @ApiOperation({ summary: 'Créer une expédition groupée' })
  create(@Body() dto: CreateShipmentDto, @CurrentUser('id') userId: string) { return this.shipmentsService.create(dto, userId); }

  @Patch(':id/status')
  @Roles('admin','agency_manager')
  @ApiOperation({ summary: 'Mettre à jour le statut de l\'expédition' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) { return this.shipmentsService.updateStatus(id, status); }

  @Post(':id/packages/:packageId')
  @Roles('admin','agency_manager','agent')
  @ApiOperation({ summary: 'Ajouter un colis à l\'expédition' })
  addPackage(@Param('id') id: string, @Param('packageId') packageId: string) { return this.shipmentsService.addPackage(id, packageId); }
}
