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
exports.AgenciesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_module_1 = require("../common/supabase/supabase.module");
let AgenciesService = class AgenciesService {
    constructor(db) {
        this.db = db;
    }
    async findAll(country) {
        let q = this.db.from('agencies')
            .select('*, manager:profiles!manager_id(id, first_name, last_name, email)')
            .order('country').order('name');
        if (country)
            q = q.eq('country', country);
        const { data, error } = await q;
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data || [];
    }
    async findById(id) {
        const { data, error } = await this.db.from('agencies')
            .select('*, manager:profiles!manager_id(*)').eq('id', id).single();
        if (error || !data)
            throw new common_1.NotFoundException('Agence introuvable');
        return data;
    }
    async create(dto) {
        const { data, error } = await this.db.from('agencies').insert(dto).select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async update(id, dto) {
        const { data, error } = await this.db.from('agencies').update(dto).eq('id', id).select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async toggleActive(id) {
        const { data: ag } = await this.db.from('agencies').select('is_active').eq('id', id).single();
        if (!ag)
            throw new common_1.NotFoundException('Agence introuvable');
        const { data, error } = await this.db.from('agencies')
            .update({ is_active: !ag.is_active }).eq('id', id).select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async getStats(id) {
        const { data } = await this.db.from('packages').select('status, created_at')
            .or(`origin_agency_id.eq.${id},destination_agency_id.eq.${id},current_agency_id.eq.${id}`);
        if (!data)
            return {};
        const today = new Date().toDateString();
        return {
            total: data.length,
            today: data.filter(p => new Date(p.created_at).toDateString() === today).length,
            by_status: data.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {}),
        };
    }
};
exports.AgenciesService = AgenciesService;
exports.AgenciesService = AgenciesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(supabase_module_1.SUPABASE)),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], AgenciesService);
//# sourceMappingURL=agencies.service.js.map