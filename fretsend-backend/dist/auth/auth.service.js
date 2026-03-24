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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_module_1 = require("../common/supabase/supabase.module");
let AuthService = AuthService_1 = class AuthService {
    constructor(db, jwt, config) {
        this.db = db;
        this.jwt = jwt;
        this.config = config;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async login(dto) {
        const { data: authData, error: authError } = await this.db.auth.signInWithPassword({
            email: dto.email,
            password: dto.password,
        });
        if (authError || !authData.user) {
            this.logger.warn(`Login failed for ${dto.email}`);
            throw new common_1.UnauthorizedException('Email ou mot de passe incorrect');
        }
        const { data: profile, error: profileError } = await this.db
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();
        if (profileError || !profile) {
            this.logger.error(`Profile not found for user ${authData.user.id}`);
            throw new common_1.UnauthorizedException('Profil introuvable');
        }
        if (!profile.is_active) {
            throw new common_1.UnauthorizedException('Compte désactivé. Contactez l\'administration.');
        }
        let agency = null;
        if (profile.agency_id) {
            const { data: agencyData, error: agencyError } = await this.db
                .from('agencies')
                .select('id, name, city, country')
                .eq('id', profile.agency_id)
                .maybeSingle();
            if (agencyError) {
                this.logger.warn(`Agency load failed for user ${profile.id}`);
            }
            else {
                agency = agencyData;
            }
        }
        const tokens = await this.generateTokens(profile);
        this.logger.log(`Connexion : ${profile.email} (${profile.role})`);
        return {
            profile: {
                id: profile.id,
                email: profile.email,
                first_name: profile.first_name,
                last_name: profile.last_name,
                role: profile.role,
                agency_id: profile.agency_id,
                agency: agency,
                phone: profile.phone,
            },
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_in: this.config.get('JWT_EXPIRES_IN', '15m'),
        };
    }
    async register(dto) {
        const { data: existing } = await this.db
            .from('profiles')
            .select('id')
            .eq('email', dto.email)
            .single();
        if (existing) {
            throw new common_1.ConflictException('Cet email est déjà utilisé');
        }
        const { data, error } = await this.db.auth.admin.createUser({
            email: dto.email,
            password: dto.password,
            email_confirm: true,
            user_metadata: {
                first_name: dto.first_name,
                last_name: dto.last_name,
                role: 'client',
            },
        });
        if (error)
            throw new common_1.BadRequestException(error.message);
        if (dto.phone && data.user) {
            await this.db
                .from('profiles')
                .update({ phone: dto.phone })
                .eq('id', data.user.id);
        }
        this.logger.log(`Inscription : ${dto.email}`);
        return { message: 'Compte créé avec succès. Vous pouvez maintenant vous connecter.' };
    }
    async refresh(refreshToken) {
        try {
            const payload = this.jwt.verify(refreshToken, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
            });
            const { data: profile } = await this.db
                .from('profiles')
                .select('id, email, role, agency_id, is_active')
                .eq('id', payload.sub)
                .single();
            if (!profile || !profile.is_active) {
                throw new common_1.UnauthorizedException('Utilisateur introuvable ou désactivé');
            }
            return this.generateTokens(profile);
        }
        catch {
            throw new common_1.UnauthorizedException('Refresh token invalide ou expiré. Veuillez vous reconnecter.');
        }
    }
    async getMe(userId) {
        const { data, error } = await this.db
            .from('profiles')
            .select('*, agency:agencies(id, name, city, country, phone, email)')
            .eq('id', userId)
            .single();
        if (error)
            throw new common_1.UnauthorizedException('Profil introuvable');
        return data;
    }
    async logout(userId) {
        await this.db.auth.admin.signOut(userId);
        this.logger.log(`Déconnexion : ${userId}`);
        return { message: 'Déconnecté avec succès' };
    }
    async generateTokens(profile) {
        const payload = {
            sub: profile.id,
            email: profile.email,
            role: profile.role,
            agency_id: profile.agency_id,
        };
        const [access_token, refresh_token] = await Promise.all([
            this.jwt.signAsync(payload, {
                secret: this.config.get('JWT_SECRET'),
                expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
            }),
            this.jwt.signAsync(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
                expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
            }),
        ]);
        return { access_token, refresh_token };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(supabase_module_1.SUPABASE)),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map