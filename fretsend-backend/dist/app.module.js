"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const throttler_2 = require("@nestjs/throttler");
const supabase_module_1 = require("./common/supabase/supabase.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const agencies_module_1 = require("./agencies/agencies.module");
const packages_module_1 = require("./packages/packages.module");
const shipments_module_1 = require("./shipments/shipments.module");
const pricing_module_1 = require("./pricing/pricing.module");
const tracking_module_1 = require("./tracking/tracking.module");
const notifications_module_1 = require("./notifications/notifications.module");
const websocket_module_1 = require("./websocket/websocket.module");
const payment_module_1 = require("./payment/payment.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            throttler_1.ThrottlerModule.forRoot([{ name: 'global', ttl: 60_000, limit: 100 }]),
            supabase_module_1.SupabaseModule,
            auth_module_1.AuthModule, users_module_1.UsersModule, agencies_module_1.AgenciesModule, packages_module_1.PackagesModule,
            shipments_module_1.ShipmentsModule, pricing_module_1.PricingModule, tracking_module_1.TrackingModule,
            notifications_module_1.NotificationsModule, websocket_module_1.WebsocketModule, payment_module_1.PaymentModule,
        ],
        providers: [{ provide: core_1.APP_GUARD, useClass: throttler_2.ThrottlerGuard }],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map