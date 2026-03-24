import { PackagesService } from './packages.service';
import { CreatePackageDto, UpdateStatusDto, PackageQueryDto } from './packages.dto';
export declare class PackagesController {
    private readonly packagesService;
    constructor(packagesService: PackagesService);
    findAll(query: PackageQueryDto, userId: string, role: string, agencyId: string): Promise<{
        data: any[];
        count: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getStats(role: string, agencyId: string): Promise<{
        total?: undefined;
        created_today?: undefined;
        by_status?: undefined;
        by_transport?: undefined;
        revenue_eur?: undefined;
    } | {
        total: number;
        created_today: number;
        by_status: Record<string, number>;
        by_transport: Record<string, number>;
        revenue_eur: number;
    }>;
    trackPublic(trackingNumber: string): Promise<any>;
    findById(id: string, userId: string, role: string): Promise<any>;
    create(dto: CreatePackageDto, userId: string): Promise<any>;
    updateStatus(id: string, dto: UpdateStatusDto, userId: string): Promise<{
        message: string;
    }>;
}
