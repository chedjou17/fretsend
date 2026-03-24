import { AgenciesService } from './agencies.service';
import { CreateAgencyDto } from './agencies.dto';
export declare class AgenciesController {
    private readonly agenciesService;
    constructor(agenciesService: AgenciesService);
    findAll(country?: string): Promise<any[]>;
    findById(id: string): Promise<any>;
    getStats(id: string): Promise<{
        total?: undefined;
        today?: undefined;
        by_status?: undefined;
    } | {
        total: number;
        today: number;
        by_status: Record<string, number>;
    }>;
    create(dto: CreateAgencyDto): Promise<any>;
    update(id: string, dto: Partial<CreateAgencyDto>): Promise<any>;
    toggle(id: string): Promise<any>;
}
