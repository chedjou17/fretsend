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
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_module_1 = require("../common/supabase/supabase.module");
let PricingService = class PricingService {
    constructor(db) {
        this.db = db;
    }
    async findAll() {
        const { data, error } = await this.db.from('pricing_rules').select('*')
            .order('origin_country').order('transport_type').order('weight_min_kg');
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data || [];
    }
    async calculate(dto) {
        const { data, error } = await this.db.rpc('calculate_price', {
            p_transport: dto.transport_type, p_origin: dto.origin_country,
            p_destination: dto.destination_country, p_weight: dto.weight_kg,
        });
        if (error)
            throw new common_1.BadRequestException(error.message);
        let price = Number(data) || 0;
        if (dto.is_urgent)
            price *= 1.5;
        if (dto.is_fragile)
            price += dto.origin_country === 'FR' ? 5 : 500;
        if (dto.is_insured && dto.declared_value)
            price += dto.declared_value * 0.02;
        return { price: Math.round(price * 100) / 100, currency: dto.origin_country === 'FR' ? 'EUR' : 'XAF', eta_days: dto.transport_type === 'air' ? 5 : 25 };
    }
    async create(dto) {
        const { data, error } = await this.db.from('pricing_rules').insert(dto).select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async update(id, dto) {
        const { data, error } = await this.db.from('pricing_rules').update(dto).eq('id', id).select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(supabase_module_1.SUPABASE)),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], PricingService);
//# sourceMappingURL=pricing.service.js.map