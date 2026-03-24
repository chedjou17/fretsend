import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, IsUUID, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgencyDto {
  @ApiProperty({ example: 'FretSend Paris Nation' }) @IsString() name: string;
  @ApiProperty({ enum: ['FR','CM'] }) @IsEnum(['FR','CM']) country: 'FR' | 'CM';
  @ApiProperty({ example: 'Paris' }) @IsString() city: string;
  @ApiProperty({ example: '15 Avenue du Trône, 75012' }) @IsString() address: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() is_hub?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsUUID() manager_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() latitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() longitude?: number;
}
