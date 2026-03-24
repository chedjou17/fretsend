import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { Public, Roles } from '../common/decorators/index';

@ApiTags('Tracking')
@ApiBearerAuth('JWT')
@Controller({ path: 'tracking', version: '1' })
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('stats/global')
  @Roles('admin','agency_manager')
  @ApiOperation({ summary: 'Statistiques globales' })
  getGlobalStats() { return this.trackingService.getGlobalStats(); }

  @Get('stats/monthly')
  @Roles('admin','agency_manager')
  @ApiOperation({ summary: 'Statistiques mensuelles (12 mois)' })
  getMonthlyStats() { return this.trackingService.getMonthlyStats(); }

  @Get('stats/agencies')
  @Roles('admin','agency_manager')
  @ApiOperation({ summary: 'Performance par agence' })
  getAgencyStats() { return this.trackingService.getAgencyStats(); }

  @Public()
  @Get(':packageId/events')
  @ApiOperation({ summary: 'Événements de suivi d\'un colis (public)' })
  getEvents(@Param('packageId') packageId: string) { return this.trackingService.getEvents(packageId); }
}
