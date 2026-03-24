import {
  Injectable,
  UnauthorizedException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE } from '../supabase/supabase.module';
import { IS_PUBLIC, ROLES_KEY, UserRole } from '../decorators/index';

// ─────────────────────────────────────────────────────────
// JWT STRATEGY
// Extrait et valide le Bearer token depuis le header Authorization.
// Vérifie que l'utilisateur existe en base et est actif.
// ─────────────────────────────────────────────────────────
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    @Inject(SUPABASE) private readonly db: SupabaseClient,
  ) {
    super({
      jwtFromRequest:   ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:      config.get<string>('JWT_SECRET'),
    });
  }

  // Appelé automatiquement après vérification de la signature JWT
  async validate(payload: { sub: string; email: string; role: string; agency_id?: string }) {
    const { data: profile, error } = await this.db
      .from('profiles')
      .select('id, email, role, agency_id, is_active, first_name, last_name')
      .eq('id', payload.sub)
      .single();

    if (error || !profile) {
      throw new UnauthorizedException('Token invalide — utilisateur introuvable');
    }
    if (!profile.is_active) {
      throw new UnauthorizedException('Compte désactivé');
    }

    // Ce retour est disponible via @CurrentUser() dans les contrôleurs
    return profile;
  }
}

// ─────────────────────────────────────────────────────────
// JWT AUTH GUARD
// Protège toutes les routes par défaut.
// Exclure une route : décorer avec @Public()
// ─────────────────────────────────────────────────────────
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Si la route est marquée @Public(), laisser passer sans vérification
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new UnauthorizedException('Token d\'accès manquant ou expiré');
    }
    return user;
  }
}

// ─────────────────────────────────────────────────────────
// ROLES GUARD
// Vérifie que l'utilisateur connecté a le bon rôle.
// Usage : @Roles('admin', 'agency_manager')
// ─────────────────────────────────────────────────────────
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si pas de @Roles() défini → accès libre aux utilisateurs authentifiés
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Non authentifié');

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Accès refusé. Rôle requis : ${requiredRoles.join(' ou ')}. Votre rôle : ${user.role}`,
      );
    }
    return true;
  }
}
