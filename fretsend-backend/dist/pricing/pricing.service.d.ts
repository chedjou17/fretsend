import { SupabaseClient } from '@supabase/supabase-js';
import { CreatePricingRuleDto, CalculatePriceDto } from './pricing.dto';
export declare class PricingService {
    private readonly db;
    constructor(db: SupabaseClient);
    findAll(): Promise<any[]>;
    calculate(dto: CalculatePriceDto): Promise<{
        price: number;
        currency: string;
        eta_days: number;
    }>;
    create(dto: CreatePricingRuleDto): Promise<any>;
    update(id: string, dto: Partial<CreatePricingRuleDto>): Promise<any>;
}
