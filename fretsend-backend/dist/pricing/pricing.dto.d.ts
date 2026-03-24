export declare class CreatePricingRuleDto {
    transport_type: 'air' | 'sea';
    origin_country: 'FR' | 'CM';
    destination_country: 'FR' | 'CM';
    weight_min_kg: number;
    weight_max_kg?: number;
    price_per_kg: number;
    base_price: number;
    currency: 'EUR' | 'XAF';
    is_active?: boolean;
}
export declare class CalculatePriceDto {
    transport_type: 'air' | 'sea';
    origin_country: 'FR' | 'CM';
    destination_country: 'FR' | 'CM';
    weight_kg: number;
    is_urgent?: boolean;
    is_fragile?: boolean;
    is_insured?: boolean;
    declared_value?: number;
}
