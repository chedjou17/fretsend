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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_module_1 = require("../common/supabase/supabase.module");
let UsersService = class UsersService {
    constructor(db) {
        this.db = db;
    }
    async findAll(search) {
        let q = this.db.from('profiles').select('*, agency:agencies(id, name, city, country)').order('created_at', { ascending: false });
        if (search)
            q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
        const { data, error } = await q;
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data || [];
    }
    async findById(id) {
        const { data, error } = await this.db.from('profiles').select('*, agency:agencies(*)').eq('id', id).single();
        if (error || !data)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        return data;
    }
    async create(dto) {
        const { data: existing } = await this.db.from('profiles').select('id').eq('email', dto.email).single();
        if (existing)
            throw new common_1.ConflictException('Email déjà utilisé');
        const { data, error } = await this.db.auth.admin.createUser({
            email: dto.email, password: dto.password, email_confirm: true,
            user_metadata: { first_name: dto.first_name, last_name: dto.last_name, role: dto.role },
        });
        if (error)
            throw new common_1.BadRequestException(error.message);
        await this.db.from('profiles').update({
            first_name: dto.first_name, last_name: dto.last_name,
            phone: dto.phone, role: dto.role, agency_id: dto.agency_id || null,
        }).eq('id', data.user.id);
        return { id: data.user.id, email: data.user.email, role: dto.role };
    }
    async update(id, dto) {
        const { data, error } = await this.db.from('profiles').update(dto).eq('id', id).select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async updateSelf(userId, dto) {
        const { data, error } = await this.db.from('profiles').update(dto).eq('id', userId).select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async checkByEmail(email) {
        const { data } = await this.db
            .from('profiles')
            .select('id, first_name, last_name, email')
            .eq('email', email)
            .single();
        if (data)
            return { found: true, id: data.id, full_name: `${data.first_name} ${data.last_name}`.trim() };
        return { found: false };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(supabase_module_1.SUPABASE)),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], UsersService);
//# sourceMappingURL=users.service.js.map