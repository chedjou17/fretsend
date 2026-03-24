import { IsString, IsEmail, IsOptional, IsEnum, IsUUID, MinLength, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
  @ApiProperty() @IsString() first_name: string;
  @ApiProperty() @IsString() last_name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiProperty({ enum: ['admin','agency_manager','agent','client'] })
  @IsEnum(['admin','agency_manager','agent','client']) role: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() agency_id?: string;
}

export class UpdateUserDto {
  @IsOptional() @IsString() first_name?: string;
  @IsOptional() @IsString() last_name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEnum(['admin','agency_manager','agent','client']) role?: string;
  @IsOptional() @IsUUID() agency_id?: string;
  @IsOptional() @IsBoolean() is_active?: boolean;
}
