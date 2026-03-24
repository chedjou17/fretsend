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
exports.TrackingService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_module_1 = require("../common/supabase/supabase.module");
let TrackingService = class TrackingService {
    constructor(db) {
        this.db = db;
    }
    async getEvents(packageId) {
        const { data, error } = await this.db.from('tracking_events').select('*')
            .eq('package_id', packageId).order('created_at', { ascending: false });
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data || [];
    }
    async getGlobalStats() {
        const { data, error } = await this.db.from('global_stats').select('*').single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async getMonthlyStats() {
        const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
        const { data, error } = await this.db.from('packages')
            .select('created_at, status, price, currency').gte('created_at', yearStart);
        if (error)
            throw new common_1.BadRequestException(error.message);
        if (!data)
            return [];
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const grouped = {};
        data.forEach(p => {
            const k = months[new Date(p.created_at).getMonth()];
            if (!grouped[k])
                grouped[k] = { month: k, total: 0, delivered: 0, revenue: 0 };
            grouped[k].total++;
            if (p.status === 'delivered')
                grouped[k].delivered++;
            if (p.price)
                grouped[k].revenue += Number(p.price);
        });
        return Object.values(grouped);
    }
    async getAgencyStats() {
        const { data, error } = await this.db.from('packages').select('origin_agency_id, status, origin_agency_name, origin_city');
        if (error)
            throw new common_1.BadRequestException(error.message);
        if (!data)
            return [];
        const map = {};
        data.forEach(p => {
            const k = p.origin_agency_id;
            if (!map[k])
                map[k] = { name: p.origin_agency_name || k, city: p.origin_city || '', total: 0, delivered: 0 };
            map[k].total++;
            if (p.status === 'delivered')
                map[k].delivered++;
        });
        return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 10);
    }
};
exports.TrackingService = TrackingService;
exports.TrackingService = TrackingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(supabase_module_1.SUPABASE)),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], TrackingService);
//# sourceMappingURL=tracking.service.js.map