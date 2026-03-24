import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

import { SupabaseModule }      from './common/supabase/supabase.module';
import { AuthModule }          from './auth/auth.module';
import { UsersModule }         from './users/users.module';
import { AgenciesModule }      from './agencies/agencies.module';
import { PackagesModule }      from './packages/packages.module';
import { ShipmentsModule }     from './shipments/shipments.module';
import { PricingModule }       from './pricing/pricing.module';
import { TrackingModule }      from './tracking/tracking.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WebsocketModule }     from './websocket/websocket.module';
import { PaymentModule }       from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([{ name:'global', ttl:60_000, limit:100 }]),
    SupabaseModule,
    AuthModule, UsersModule, AgenciesModule, PackagesModule,
    ShipmentsModule, PricingModule, TrackingModule,
    NotificationsModule, WebsocketModule, PaymentModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
