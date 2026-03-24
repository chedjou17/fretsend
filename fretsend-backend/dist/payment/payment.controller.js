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
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payment_service_1 = require("./payment.service");
const index_1 = require("../common/decorators/index");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
class PaymentActionDto {
}
__decorate([
    (0, swagger_2.ApiProperty)({ enum: ['paid', 'unpaid', 'problem'] }),
    (0, class_validator_1.IsEnum)(['paid', 'unpaid', 'problem']),
    __metadata("design:type", String)
], PaymentActionDto.prototype, "action", void 0);
let PaymentController = class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    verify(token) {
        return this.paymentService.verifyToken(token);
    }
    process(token, dto) {
        return this.paymentService.processAction(token, dto.action);
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, index_1.Public)(),
    (0, common_1.Get)(':token'),
    (0, swagger_1.ApiOperation)({ summary: 'Vérifier un lien de paiement' }),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "verify", null);
__decorate([
    (0, index_1.Public)(),
    (0, common_1.Post)(':token'),
    (0, swagger_1.ApiOperation)({ summary: 'Traiter l\'action de paiement (paid/unpaid/problem)' }),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, PaymentActionDto]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "process", null);
exports.PaymentController = PaymentController = __decorate([
    (0, swagger_1.ApiTags)('Payment'),
    (0, common_1.Controller)({ path: 'payment', version: '1' }),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map