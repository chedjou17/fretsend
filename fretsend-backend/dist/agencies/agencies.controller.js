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
exports.AgenciesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const agencies_service_1 = require("./agencies.service");
const agencies_dto_1 = require("./agencies.dto");
const index_1 = require("../common/decorators/index");
let AgenciesController = class AgenciesController {
    constructor(agenciesService) {
        this.agenciesService = agenciesService;
    }
    findAll(country) { return this.agenciesService.findAll(country); }
    findById(id) { return this.agenciesService.findById(id); }
    getStats(id) { return this.agenciesService.getStats(id); }
    create(dto) { return this.agenciesService.create(dto); }
    update(id, dto) { return this.agenciesService.update(id, dto); }
    toggle(id) { return this.agenciesService.toggleActive(id); }
};
exports.AgenciesController = AgenciesController;
__decorate([
    (0, index_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des agences (public)' }),
    __param(0, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AgenciesController.prototype, "findAll", null);
__decorate([
    (0, index_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AgenciesController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, index_1.Roles)('admin', 'agency_manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques d\'une agence' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AgenciesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)(),
    (0, index_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une agence (admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agencies_dto_1.CreateAgencyDto]),
    __metadata("design:returntype", void 0)
], AgenciesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, index_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AgenciesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/toggle'),
    (0, index_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Activer / désactiver une agence' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AgenciesController.prototype, "toggle", null);
exports.AgenciesController = AgenciesController = __decorate([
    (0, swagger_1.ApiTags)('Agencies'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.Controller)({ path: 'agencies', version: '1' }),
    __metadata("design:paramtypes", [agencies_service_1.AgenciesService])
], AgenciesController);
//# sourceMappingURL=agencies.controller.js.map