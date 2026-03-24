import { IsEnum, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePricingRuleDto {
  @ApiProperty({ enum: ['air','sea'] }) @IsEnum(['air','sea']) transport_type: 'air'|'sea';
  @ApiProperty({ enum: ['FR','CM'] }) @IsEnum(['FR','CM']) origin_country: 'FR'|'CM';
  @ApiProperty({ enum: ['FR','CM'] }) @IsEnum(['FR','CM']) destination_country: 'FR'|'CM';
  @ApiProperty() @IsNumber() @Type(() => Number) weight_min_kg: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) weight_max_kg?: number;
  @ApiProperty() @IsNumber() @Type(() => Number) price_per_kg: number;
  @ApiProperty() @IsNumber() @Type(() => Number) base_price: number;
  @ApiProperty({ enum: ['EUR','XAF'] }) @IsEnum(['EUR','XAF']) currency: 'EUR'|'XAF';
  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_active?: boolean;
}

export class CalculatePriceDto {
  @ApiProperty({ enum: ['air','sea'] }) @IsEnum(['air','sea']) transport_type: 'air'|'sea';
  @ApiProperty({ enum: ['FR','CM'] }) @IsEnum(['FR','CM']) origin_country: 'FR'|'CM';
  @ApiProperty({ enum: ['FR','CM'] }) @IsEnum(['FR','CM']) destination_country: 'FR'|'CM';
  @ApiProperty({ example: 5.5 }) @IsNumber() @Type(() => Number) weight_kg: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_urgent?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_fragile?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_insured?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) declared_value?: number;
}
