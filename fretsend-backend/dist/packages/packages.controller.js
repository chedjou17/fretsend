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
exports.PackagesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const packages_service_1 = require("./packages.service");
const packages_dto_1 = require("./packages.dto");
const index_1 = require("../common/decorators/index");
let PackagesController = class PackagesController {
    constructor(packagesService) {
        this.packagesService = packagesService;
    }
    findAll(query, userId, role, agencyId) {
        return this.packagesService.findAll(query, userId, role, agencyId);
    }
    getStats(role, agencyId) {
        return this.packagesService.getStats(role, agencyId);
    }
    trackPublic(trackingNumber) {
        return this.packagesService.findByTracking(trackingNumber);
    }
    findById(id, userId, role) {
        return this.packagesService.findById(id, userId, role);
    }
    create(dto, userId) {
        return this.packagesService.create(dto, userId);
    }
    updateStatus(id, dto, userId) {
        return this.packagesService.updateStatus(id, dto, userId);
    }
};
exports.PackagesController = PackagesController;
__decorate([
    (0, common_1.Get)(),
    (0, index_1.Roles)('admin', 'agency_manager', 'agent', 'client'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des colis avec filtres et pagination' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, index_1.CurrentUser)('id')),
    __param(2, (0, index_1.CurrentUser)('role')),
    __param(3, (0, index_1.CurrentUser)('agency_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [packages_dto_1.PackageQueryDto, String, String, String]),
    __metadata("design:returntype", void 0)
], PackagesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, index_1.Roles)('admin', 'agency_manager', 'agent'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques des colis (scope selon rôle)' }),
    __param(0, (0, index_1.CurrentUser)('role')),
    __param(1, (0, index_1.CurrentUser)('agency_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PackagesController.prototype, "getStats", null);
__decorate([
    (0, index_1.Public)(),
    (0, common_1.Get)('track/:trackingNumber'),
    (0, swagger_1.ApiOperation)({ summary: 'Suivi public d\'un colis — sans authentification' }),
    (0, swagger_1.ApiParam)({ name: 'trackingNumber', example: 'FS-FR-20250315-00042' }),
    __param(0, (0, common_1.Param)('trackingNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PackagesController.prototype, "trackPublic", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, index_1.Roles)('admin', 'agency_manager', 'agent', 'client'),
    (0, swagger_1.ApiOperation)({ summary: 'Détail d\'un colis par ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, index_1.CurrentUser)('id')),
    __param(2, (0, index_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PackagesController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, index_1.Roles)('admin', 'agency_manager', 'agent'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un nouveau colis' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, index_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [packages_dto_1.CreatePackageDto, String]),
    __metadata("design:returntype", void 0)
], PackagesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, index_1.Roles)('admin', 'agency_manager', 'agent'),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour le statut d\'un colis' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, index_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, packages_dto_1.UpdateStatusDto, String]),
    __metadata("design:returntype", void 0)
], PackagesController.prototype, "updateStatus", null);
exports.PackagesController = PackagesController = __decorate([
    (0, swagger_1.ApiTags)('Packages'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.Controller)({ path: 'packages', version: '1' }),
    __metadata("design:paramtypes", [packages_service_1.PackagesService])
], PackagesController);
//# sourceMappingURL=packages.controller.js.map