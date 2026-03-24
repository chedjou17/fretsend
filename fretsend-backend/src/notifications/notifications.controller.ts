import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { Roles } from '../common/decorators/index';

@ApiTags('Notifications')
@ApiBearerAuth('JWT')
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles('admin', 'agency_manager')
  @ApiOperation({ summary: 'Historique des notifications' })
  findAll(@Query('package_id') packageId?: string) {
    return this.notificationsService.findAll(packageId);
  }
}
