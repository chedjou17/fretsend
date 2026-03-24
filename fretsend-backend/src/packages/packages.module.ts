import { Module } from '@nestjs/common';
import { PackagesController } from './packages.controller';
import { PackagesService }    from './packages.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { WebsocketModule }     from '../websocket/websocket.module';

@Module({
  imports:     [NotificationsModule, WebsocketModule],
  controllers: [PackagesController],
  providers:   [PackagesService],
  exports:     [PackagesService],
})
export class PackagesModule {}
