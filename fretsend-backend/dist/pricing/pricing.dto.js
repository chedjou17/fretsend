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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculatePriceDto = exports.CreatePricingRuleDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreatePricingRuleDto {
}
exports.CreatePricingRuleDto = CreatePricingRuleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['air', 'sea'] }),
    (0, class_validator_1.IsEnum)(['air', 'sea']),
    __metadata("design:type", String)
], CreatePricingRuleDto.prototype, "transport_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['FR', 'CM'] }),
    (0, class_validator_1.IsEnum)(['FR', 'CM']),
    __metadata("design:type", String)
], CreatePricingRuleDto.prototype, "origin_country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['FR', 'CM'] }),
    (0, class_validator_1.IsEnum)(['FR', 'CM']),
    __metadata("design:type", String)
], CreatePricingRuleDto.prototype, "destination_country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePricingRuleDto.prototype, "weight_min_kg", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePricingRuleDto.prototype, "weight_max_kg", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePricingRuleDto.prototype, "price_per_kg", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePricingRuleDto.prototype, "base_price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['EUR', 'XAF'] }),
    (0, class_validator_1.IsEnum)(['EUR', 'XAF']),
    __metadata("design:type", String)
], CreatePricingRuleDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePricingRuleDto.prototype, "is_active", void 0);
class CalculatePriceDto {
}
exports.CalculatePriceDto = CalculatePriceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['air', 'sea'] }),
    (0, class_validator_1.IsEnum)(['air', 'sea']),
    __metadata("design:type", String)
], CalculatePriceDto.prototype, "transport_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['FR', 'CM'] }),
    (0, class_validator_1.IsEnum)(['FR', 'CM']),
    __metadata("design:type", String)
], CalculatePriceDto.prototype, "origin_country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['FR', 'CM'] }),
    (0, class_validator_1.IsEnum)(['FR', 'CM']),
    __metadata("design:type", String)
], CalculatePriceDto.prototype, "destination_country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5.5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CalculatePriceDto.prototype, "weight_kg", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CalculatePriceDto.prototype, "is_urgent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CalculatePriceDto.prototype, "is_fragile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CalculatePriceDto.prototype, "is_insured", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CalculatePriceDto.prototype, "declared_value", void 0);
//# sourceMappingURL=pricing.dto.js.map