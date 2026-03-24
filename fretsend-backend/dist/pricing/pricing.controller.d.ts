import { PricingService } from './pricing.service';
import { CreatePricingRuleDto, CalculatePriceDto } from './pricing.dto';
export declare class PricingController {
    private readonly pricingService;
    constructor(pricingService: PricingService);
    findAll(): Promise<any[]>;
    calculate(dto: CalculatePriceDto): Promise<{
        price: number;
        currency: string;
        eta_days: number;
    }>;
    create(dto: CreatePricingRuleDto): Promise<any>;
    update(id: string, dto: Partial<CreatePricingRuleDto>): Promise<any>;
}
