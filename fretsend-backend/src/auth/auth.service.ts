import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE } from '../common/supabase/supabase.module';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(SUPABASE)        private readonly db: SupabaseClient,
    private readonly jwt:    JwtService,
    private readonly config: ConfigService,
  ) {}

  // ── Connexion ─────────────────────────────────────────
async login(dto: LoginDto) {
  // 1. Auth Supabase
  const { data: authData, error: authError } = await this.db.auth.signInWithPassword({
    email: dto.email,
    password: dto.password,
  });

  if (authError || !authData.user) {
    this.logger.warn(`Login failed for ${dto.email}`);
    throw new UnauthorizedException('Email ou mot de passe incorrect');
  }

  // 2. Récupérer le profil (SANS jointure → SAFE)
  const { data: profile, error: profileError } = await this.db
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profile) {
    this.logger.error(`Profile not found for user ${authData.user.id}`);
    throw new UnauthorizedException('Profil introuvable');
  }

  if (!profile.is_active) {
    throw new UnauthorizedException('Compte désactivé. Contactez l\'administration.');
  }

  // 3. Charger l’agence (SAFE comme ton ancienne version)
  let agency: any = null;

  if (profile.agency_id) {
    const { data: agencyData, error: agencyError } = await this.db
      .from('agencies')
      .select('id, name, city, country')
      .eq('id', profile.agency_id)
      .maybeSingle(); // ✅ important

    if (agencyError) {
      this.logger.warn(`Agency load failed for user ${profile.id}`);
    } else {
      agency = agencyData;
    }
  }

  // 4. Générer les tokens
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
      agency: agency, // ✅ SAFE
      phone: profile.phone,
    },
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_in: this.config.get('JWT_EXPIRES_IN', '15m'),
  };
}
  // ── Inscription ───────────────────────────────────────
  async register(dto: RegisterDto) {
    // Vérifier doublon email
    const { data: existing } = await this.db
      .from('profiles')
      .select('id')
      .eq('email', dto.email)
      .single();

    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Créer le compte Supabase Auth
    const { data, error } = await this.db.auth.admin.createUser({
      email:         dto.email,
      password:      dto.password,
      email_confirm: true,
      user_metadata: {
        first_name: dto.first_name,
        last_name:  dto.last_name,
        role:       'client',
      },
    });

    if (error) throw new BadRequestException(error.message);

    // Le trigger SQL crée le profil automatiquement
    // On met à jour le téléphone si fourni
    if (dto.phone && data.user) {
      await this.db
        .from('profiles')
        .update({ phone: dto.phone })
        .eq('id', data.user.id);
    }

    this.logger.log(`Inscription : ${dto.email}`);
    return { message: 'Compte créé avec succès. Vous pouvez maintenant vous connecter.' };
  }

  // ── Refresh Token ─────────────────────────────────────
  async refresh(refreshToken: string) {
    try {
      // Vérifier la signature du refresh token
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      // Vérifier que l'utilisateur existe et est actif
      const { data: profile } = await this.db
        .from('profiles')
        .select('id, email, role, agency_id, is_active')
        .eq('id', payload.sub)
        .single();

      if (!profile || !profile.is_active) {
        throw new UnauthorizedException('Utilisateur introuvable ou désactivé');
      }

      return this.generateTokens(profile);
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré. Veuillez vous reconnecter.');
    }
  }

  // ── Profil connecté ───────────────────────────────────
  async getMe(userId: string) {
    const { data, error } = await this.db
      .from('profiles')
      .select('*, agency:agencies(id, name, city, country, phone, email)')
      .eq('id', userId)
      .single();

    if (error) throw new UnauthorizedException('Profil introuvable');
    return data;
  }

  // ── Déconnexion ───────────────────────────────────────
  async logout(userId: string) {
    // Révoquer la session Supabase côté serveur
    await this.db.auth.admin.signOut(userId);
    this.logger.log(`Déconnexion : ${userId}`);
    return { message: 'Déconnecté avec succès' };
  }

  // ── Génération des tokens ─────────────────────────────
  private async generateTokens(profile: any) {
    const payload = {
      sub:       profile.id,
      email:     profile.email,
      role:      profile.role,
      agency_id: profile.agency_id,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret:    this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwt.signAsync(payload, {
        secret:    this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { access_token, refresh_token };
  }
}
