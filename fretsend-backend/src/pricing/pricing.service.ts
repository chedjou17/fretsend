import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE } from '../common/supabase/supabase.module';
import { CreatePricingRuleDto, CalculatePriceDto } from './pricing.dto';

@Injectable()
export class PricingService {
  constructor(@Inject(SUPABASE) private readonly db: SupabaseClient) {}

  async findAll() {
    const { data, error } = await this.db.from('pricing_rules').select('*')
      .order('origin_country').order('transport_type').order('weight_min_kg');
    if (error) throw new BadRequestException(error.message);
    return data || [];
  }

  async calculate(dto: CalculatePriceDto) {
    const { data, error } = await this.db.rpc('calculate_price', {
      p_transport: dto.transport_type, p_origin: dto.origin_country,
      p_destination: dto.destination_country, p_weight: dto.weight_kg,
    });
    if (error) throw new BadRequestException(error.message);
    let price = Number(data) || 0;
    if (dto.is_urgent)                      price *= 1.5;
    if (dto.is_fragile)                     price += dto.origin_country === 'FR' ? 5 : 500;
    if (dto.is_insured && dto.declared_value) price += dto.declared_value * 0.02;
    return { price: Math.round(price * 100) / 100, currency: dto.origin_country === 'FR' ? 'EUR' : 'XAF', eta_days: dto.transport_type === 'air' ? 5 : 25 };
  }

  async create(dto: CreatePricingRuleDto) {
    const { data, error } = await this.db.from('pricing_rules').insert(dto).select().single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async update(id: string, dto: Partial<CreatePricingRuleDto>) {
    const { data, error } = await this.db.from('pricing_rules').update(dto).eq('id', id).select().single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }
}
