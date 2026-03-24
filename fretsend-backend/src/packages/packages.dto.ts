import {
  IsString, IsEmail, IsOptional, IsEnum,
  IsNumber, IsBoolean, IsUUID, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePackageDto {
  // Expéditeur
  @ApiProperty({ example: 'Jean Dupont' })
  @IsString()
  sender_name: string;

  @ApiProperty({ example: '+33 6 12 34 56 78' })
  @IsString()
  sender_phone: string;

  @ApiPropertyOptional({ example: 'jean@email.com' })
  @IsOptional() @IsEmail()
  sender_email?: string;

  // Destinataire
  @ApiProperty({ example: 'Marie Ngom' })
  @IsString()
  recipient_name: string;

  @ApiProperty({ example: '+237 6 99 00 11 22' })
  @IsString()
  recipient_phone: string;

  @ApiPropertyOptional({ example: 'marie@email.cm' })
  @IsOptional() @IsEmail()
  recipient_email?: string;

  // Agences
  @ApiProperty({ description: 'UUID de l\'agence d\'expédition' })
  @IsUUID()
  origin_agency_id: string;

  @ApiProperty({ description: 'UUID de l\'agence de destination' })
  @IsUUID()
  destination_agency_id: string;

  // Transport
  @ApiProperty({ enum: ['air', 'sea'], example: 'sea' })
  @IsEnum(['air', 'sea'])
  transport_type: 'air' | 'sea';

  // Colis
  @ApiProperty({ example: 5.5, description: 'Poids en kilogrammes' })
  @IsNumber() @Min(0.1) @Type(() => Number)
  weight_kg: number;

  @ApiPropertyOptional({ example: 40 })
  @IsOptional() @IsNumber() @Type(() => Number)
  length_cm?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional() @IsNumber() @Type(() => Number)
  width_cm?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional() @IsNumber() @Type(() => Number)
  height_cm?: number;

  @ApiPropertyOptional({ example: 200, description: 'Valeur déclarée pour l\'assurance' })
  @IsOptional() @IsNumber() @Type(() => Number)
  declared_value?: number;

  @ApiPropertyOptional({ example: 'Vêtements, chaussures, livres' })
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Fragile — manipuler avec soin' })
  @IsOptional() @IsString()
  notes?: string;

  // Options
  @ApiPropertyOptional({ example: false })
  @IsOptional() @IsBoolean()
  is_fragile?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional() @IsBoolean()
  is_insured?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional() @IsBoolean()
  is_urgent?: boolean;
}

export class UpdateStatusDto {
  @ApiProperty({
    enum: ['created','processing','in_transit','at_customs','arrived_hub','dispatched','available','delivered','returned'],
    example: 'in_transit',
  })
  @IsEnum(['created','processing','in_transit','at_customs','arrived_hub','dispatched','available','delivered','returned'])
  status: string;

  @ApiPropertyOptional({ description: 'UUID de l\'agence actuelle' })
  @IsOptional() @IsUUID()
  agency_id?: string;

  @ApiPropertyOptional({ example: 'Parti par vol Air France AF-702' })
  @IsOptional() @IsString()
  note?: string;

  @ApiPropertyOptional({ example: 48.8566 })
  @IsOptional() @IsNumber() @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ example: 2.3522 })
  @IsOptional() @IsNumber() @Type(() => Number)
  longitude?: number;
}

export class PackageQueryDto {
  @ApiPropertyOptional({ description: 'Recherche par numéro de suivi, nom, téléphone' })
  @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['created','processing','in_transit','at_customs','arrived_hub','dispatched','available','delivered','returned'] })
  @IsOptional() @IsEnum(['created','processing','in_transit','at_customs','arrived_hub','dispatched','available','delivered','returned'])
  status?: string;

  @ApiPropertyOptional({ enum: ['air', 'sea'] })
  @IsOptional() @IsEnum(['air', 'sea'])
  transport_type?: string;

  @ApiPropertyOptional({ description: 'Filtrer par agence (UUID)' })
  @IsOptional() @IsUUID()
  agency_id?: string;

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional() @IsString()
  date_from?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional() @IsString()
  date_to?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional() @Type(() => Number) @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional() @Type(() => Number) @IsNumber()
  limit?: number = 20;
}
