import { IsString, IsEnum, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShipmentDto {
  @ApiProperty({ enum: ['air','sea'] }) @IsEnum(['air','sea']) transport_type: 'air'|'sea';
  @ApiProperty() @IsUUID() origin_agency_id: string;
  @ApiProperty() @IsUUID() destination_agency_id: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() departure_date?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() estimated_arrival_date?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
