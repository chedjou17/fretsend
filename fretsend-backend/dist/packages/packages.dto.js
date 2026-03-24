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
exports.PackageQueryDto = exports.UpdateStatusDto = exports.CreatePackageDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreatePackageDto {
}
exports.CreatePackageDto = CreatePackageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jean Dupont' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePackageDto.prototype, "sender_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+33 6 12 34 56 78' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePackageDto.prototype, "sender_phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'jean@email.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreatePackageDto.prototype, "sender_email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Marie Ngom' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePackageDto.prototype, "recipient_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+237 6 99 00 11 22' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePackageDto.prototype, "recipient_phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'marie@email.cm' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreatePackageDto.prototype, "recipient_email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'UUID de l\'agence d\'expédition' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePackageDto.prototype, "origin_agency_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'UUID de l\'agence de destination' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePackageDto.prototype, "destination_agency_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['air', 'sea'], example: 'sea' }),
    (0, class_validator_1.IsEnum)(['air', 'sea']),
    __metadata("design:type", String)
], CreatePackageDto.prototype, "transport_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5.5, description: 'Poids en kilogrammes' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "weight_kg", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 40 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "length_cm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 30 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "width_cm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "height_cm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 200, description: 'Valeur déclarée pour l\'assurance' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "declared_value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Vêtements, chaussures, livres' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePackageDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Fragile — manipuler avec soin' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePackageDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePackageDto.prototype, "is_fragile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePackageDto.prototype, "is_insured", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePackageDto.prototype, "is_urgent", void 0);
class UpdateStatusDto {
}
exports.UpdateStatusDto = UpdateStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['created', 'processing', 'in_transit', 'at_customs', 'arrived_hub', 'dispatched', 'available', 'delivered', 'returned'],
        example: 'in_transit',
    }),
    (0, class_validator_1.IsEnum)(['created', 'processing', 'in_transit', 'at_customs', 'arrived_hub', 'dispatched', 'available', 'delivered', 'returned']),
    __metadata("design:type", String)
], UpdateStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'UUID de l\'agence actuelle' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateStatusDto.prototype, "agency_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Parti par vol Air France AF-702' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStatusDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 48.8566 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateStatusDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2.3522 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateStatusDto.prototype, "longitude", void 0);
class PackageQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.PackageQueryDto = PackageQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Recherche par numéro de suivi, nom, téléphone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PackageQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['created', 'processing', 'in_transit', 'at_customs', 'arrived_hub', 'dispatched', 'available', 'delivered', 'returned'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['created', 'processing', 'in_transit', 'at_customs', 'arrived_hub', 'dispatched', 'available', 'delivered', 'returned']),
    __metadata("design:type", String)
], PackageQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['air', 'sea'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['air', 'sea']),
    __metadata("design:type", String)
], PackageQueryDto.prototype, "transport_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filtrer par agence (UUID)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], PackageQueryDto.prototype, "agency_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-01-01' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PackageQueryDto.prototype, "date_from", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-12-31' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PackageQueryDto.prototype, "date_to", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PackageQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 20, default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PackageQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=packages.dto.js.map