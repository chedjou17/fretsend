import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@fretsend.com', description: 'Adresse email' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({ example: 'Admin123!', description: 'Mot de passe (min 6 caractères)' })
  @IsString()
  @MinLength(6, { message: 'Mot de passe trop court (min 6 caractères)' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'jean@email.com' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({ example: 'MonMotDePasse123!' })
  @IsString()
  @MinLength(8, { message: 'Mot de passe trop court (min 8 caractères)' })
  password: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  first_name: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  last_name: string;

  @ApiPropertyOptional({ example: '+33 6 00 00 00 00' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Le refresh token reçu lors du login' })
  @IsString()
  refresh_token: string;
}
