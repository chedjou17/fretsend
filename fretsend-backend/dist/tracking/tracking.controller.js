"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tracking_service_1 = require("./tracking.service");
const index_1 = require("../common/decorators/index");
let TrackingController = class TrackingController {
    constructor(trackingService) {
        this.trackingService = trackingService;
    }
    getGlobalStats() { return this.trackingService.getGlobalStats(); }
    getMonthlyStats() { return this.trackingService.getMonthlyStats(); }
    getAgencyStats() { return this.trackingService.getAgencyStats(); }
    getEvents(packageId) { return this.trackingService.getEvents(packageId); }
};
exports.TrackingController = TrackingController;
__decorate([
    (0, common_1.Get)('stats/global'),
    (0, index_1.Roles)('admin', 'agency_manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques globales' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "getGlobalStats", null);
__decorate([
    (0, common_1.Get)('stats/monthly'),
    (0, index_1.Roles)('admin', 'agency_manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques mensuelles (12 mois)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "getMonthlyStats", null);
__decorate([
    (0, common_1.Get)('stats/agencies'),
    (0, index_1.Roles)('admin', 'agency_manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Performance par agence' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "getAgencyStats", null);
__decorate([
    (0, index_1.Public)(),
    (0, common_1.Get)(':packageId/events'),
    (0, swagger_1.ApiOperation)({ summary: 'Événements de suivi d\'un colis (public)' }),
    __param(0, (0, common_1.Param)('packageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "getEvents", null);
exports.TrackingController = TrackingController = __decorate([
    (0, swagger_1.ApiTags)('Tracking'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.Controller)({ path: 'tracking', version: '1' }),
    __metadata("design:paramtypes", [tracking_service_1.TrackingService])
], TrackingController);
//# sourceMappingURL=tracking.controller.js.map