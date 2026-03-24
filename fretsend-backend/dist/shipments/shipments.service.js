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
exports.ShipmentsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_module_1 = require("../common/supabase/supabase.module");
let ShipmentsService = class ShipmentsService {
    constructor(db) {
        this.db = db;
    }
    async findAll() {
        const { data, error } = await this.db.from('shipments')
            .select('*, origin_agency:agencies!origin_agency_id(id,name,city,country), destination_agency:agencies!destination_agency_id(id,name,city,country)')
            .order('created_at', { ascending: false });
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data || [];
    }
    async findById(id) {
        const { data, error } = await this.db.from('shipments')
            .select('*, origin_agency:agencies!origin_agency_id(*), destination_agency:agencies!destination_agency_id(*)')
            .eq('id', id).single();
        if (error || !data)
            throw new common_1.NotFoundException('Expédition introuvable');
        const { data: packages } = await this.db.from('package_details').select('*').eq('shipment_id', id);
        return { ...data, packages: packages || [] };
    }
    async create(dto, userId) {
        const d = new Date();
        const ref = `SHP-${dto.transport_type.toUpperCase()}-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
        const { data, error } = await this.db.from('shipments').insert({ ...dto, reference: ref, created_by: userId }).select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async updateStatus(id, status) {
        const updates = { status };
        if (status === 'arrived')
            updates.actual_arrival_date = new Date().toISOString().split('T')[0];
        if (status === 'in_transit') {
            const { data: pkgs } = await this.db.from('packages').select('id').eq('shipment_id', id);
            for (const pkg of pkgs || []) {
                await this.db.from('packages').update({ status: 'in_transit' }).eq('id', pkg.id);
                await this.db.from('tracking_events').insert({ package_id: pkg.id, status: 'in_transit', title: 'Départ en transit international', description: 'Colis embarqué dans l\'expédition groupée' });
            }
        }
        const { data, error } = await this.db.from('shipments').update(updates).eq('id', id).select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async addPackage(shipmentId, packageId) {
        const { data: pkg } = await this.db.from('packages').select('weight_kg').eq('id', packageId).single();
        if (!pkg)
            throw new common_1.NotFoundException('Colis introuvable');
        await this.db.from('packages').update({ shipment_id: shipmentId, status: 'processing' }).eq('id', packageId);
        await this.db.from('tracking_events').insert({ package_id: packageId, status: 'processing', title: 'Colis ajouté à une expédition', description: `Colis inclus dans l'expédition` });
        const { data: s } = await this.db.from('shipments').select('total_packages, total_weight_kg').eq('id', shipmentId).single();
        if (s)
            await this.db.from('shipments').update({ total_packages: (s.total_packages || 0) + 1, total_weight_kg: (Number(s.total_weight_kg) || 0) + Number(pkg.weight_kg) }).eq('id', shipmentId);
        return { message: 'Colis ajouté à l\'expédition' };
    }
};
exports.ShipmentsService = ShipmentsService;
exports.ShipmentsService = ShipmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(supabase_module_1.SUPABASE)),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], ShipmentsService);
//# sourceMappingURL=shipments.service.js.map