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
exports.ShipmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shipments_service_1 = require("./shipments.service");
const shipments_dto_1 = require("./shipments.dto");
const index_1 = require("../common/decorators/index");
let ShipmentsController = class ShipmentsController {
    constructor(shipmentsService) {
        this.shipmentsService = shipmentsService;
    }
    findAll() { return this.shipmentsService.findAll(); }
    findById(id) { return this.shipmentsService.findById(id); }
    create(dto, userId) { return this.shipmentsService.create(dto, userId); }
    updateStatus(id, status) { return this.shipmentsService.updateStatus(id, status); }
    addPackage(id, packageId) { return this.shipmentsService.addPackage(id, packageId); }
};
exports.ShipmentsController = ShipmentsController;
__decorate([
    (0, common_1.Get)(),
    (0, index_1.Roles)('admin', 'agency_manager', 'agent'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des expéditions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, index_1.Roles)('admin', 'agency_manager', 'agent'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, index_1.Roles)('admin', 'agency_manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une expédition groupée' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, index_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shipments_dto_1.CreateShipmentDto, String]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, index_1.Roles)('admin', 'agency_manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour le statut de l\'expédition' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/packages/:packageId'),
    (0, index_1.Roles)('admin', 'agency_manager', 'agent'),
    (0, swagger_1.ApiOperation)({ summary: 'Ajouter un colis à l\'expédition' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('packageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "addPackage", null);
exports.ShipmentsController = ShipmentsController = __decorate([
    (0, swagger_1.ApiTags)('Shipments'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.Controller)({ path: 'shipments', version: '1' }),
    __metadata("design:paramtypes", [shipments_service_1.ShipmentsService])
], ShipmentsController);
//# sourceMappingURL=shipments.controller.js.map