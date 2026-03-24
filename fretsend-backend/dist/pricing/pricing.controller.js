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
exports.PricingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pricing_service_1 = require("./pricing.service");
const pricing_dto_1 = require("./pricing.dto");
const index_1 = require("../common/decorators/index");
let PricingController = class PricingController {
    constructor(pricingService) {
        this.pricingService = pricingService;
    }
    findAll() { return this.pricingService.findAll(); }
    calculate(dto) { return this.pricingService.calculate(dto); }
    create(dto) { return this.pricingService.create(dto); }
    update(id, dto) { return this.pricingService.update(id, dto); }
};
exports.PricingController = PricingController;
__decorate([
    (0, index_1.Public)(),
    (0, common_1.Get)('rules'),
    (0, swagger_1.ApiOperation)({ summary: 'Grilles tarifaires (public)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PricingController.prototype, "findAll", null);
__decorate([
    (0, index_1.Public)(),
    (0, common_1.Post)('calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculer le prix d\'un envoi (public)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pricing_dto_1.CalculatePriceDto]),
    __metadata("design:returntype", void 0)
], PricingController.prototype, "calculate", null);
__decorate([
    (0, common_1.Post)('rules'),
    (0, index_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une règle tarifaire (admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pricing_dto_1.CreatePricingRuleDto]),
    __metadata("design:returntype", void 0)
], PricingController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('rules/:id'),
    (0, index_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une règle tarifaire (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PricingController.prototype, "update", null);
exports.PricingController = PricingController = __decorate([
    (0, swagger_1.ApiTags)('Pricing'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.Controller)({ path: 'pricing', version: '1' }),
    __metadata("design:paramtypes", [pricing_service_1.PricingService])
], PricingController);
//# sourceMappingURL=pricing.controller.js.map