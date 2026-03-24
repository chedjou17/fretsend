import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './auth.dto';
import { Public, CurrentUser } from '../common/decorators/index';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/v1/auth/login
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } }) // Max 10 tentatives / minute
  @ApiOperation({ summary: 'Connexion — retourne access_token + refresh_token' })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe incorrect' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // POST /api/v1/auth/register
  @Public()
  @Post('register')
  @Throttle({ default: { ttl: 60_000, limit: 5 } }) // Max 5 inscriptions / minute
  @ApiOperation({ summary: 'Inscription (rôle client par défaut)' })
  @ApiResponse({ status: 201, description: 'Compte créé' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // POST /api/v1/auth/refresh
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renouveler l\'access_token avec le refresh_token' })
  @ApiResponse({ status: 200, description: 'Nouveaux tokens générés' })
  @ApiResponse({ status: 401, description: 'Refresh token invalide ou expiré' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refresh_token);
  }

  // GET /api/v1/auth/me
  @Get('me')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Profil de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Profil complet avec agence' })
  getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  // POST /api/v1/auth/logout
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Déconnexion — révoque la session' })
  logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }
}
