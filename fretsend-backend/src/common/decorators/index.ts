import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';

// ── Rôles autorisés ───────────────────────────────────────
// Usage : @Roles('admin', 'agency_manager')
export type UserRole = 'admin' | 'agency_manager' | 'agent' | 'client';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// ── Route publique (pas de JWT requis) ────────────────────
// Usage : @Public() sur un contrôleur ou une méthode
export const IS_PUBLIC = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC, true);

// ── Utilisateur connecté injecté depuis le token JWT ─────
// Usage : @CurrentUser() user ou @CurrentUser('id') userId
export const CurrentUser = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user    = request.user;
    return field ? user?.[field] : user;
  },
);
