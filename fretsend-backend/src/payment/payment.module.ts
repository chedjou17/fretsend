import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService }    from './payment.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { WebsocketModule }     from '../websocket/websocket.module';

@Module({
  imports:     [NotificationsModule, WebsocketModule],
  controllers: [PaymentController],
  providers:   [PaymentService],
  exports:     [PaymentService],
})
export class PaymentModule {}
