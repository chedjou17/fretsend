import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { CreatePricingRuleDto, CalculatePriceDto } from './pricing.dto';
import { Public, Roles } from '../common/decorators/index';

@ApiTags('Pricing')
@ApiBearerAuth('JWT')
@Controller({ path: 'pricing', version: '1' })
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Public()
  @Get('rules')
  @ApiOperation({ summary: 'Grilles tarifaires (public)' })
  findAll() { return this.pricingService.findAll(); }

  @Public()
  @Post('calculate')
  @ApiOperation({ summary: 'Calculer le prix d\'un envoi (public)' })
  calculate(@Body() dto: CalculatePriceDto) { return this.pricingService.calculate(dto); }

  @Post('rules')
  @Roles('admin')
  @ApiOperation({ summary: 'Créer une règle tarifaire (admin)' })
  create(@Body() dto: CreatePricingRuleDto) { return this.pricingService.create(dto); }

  @Patch('rules/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Modifier une règle tarifaire (admin)' })
  update(@Param('id') id: string, @Body() dto: Partial<CreatePricingRuleDto>) { return this.pricingService.update(id, dto); }
}
