import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './shipments.dto';
export declare class ShipmentsController {
    private readonly shipmentsService;
    constructor(shipmentsService: ShipmentsService);
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any>;
    create(dto: CreateShipmentDto, userId: string): Promise<any>;
    updateStatus(id: string, status: string): Promise<any>;
    addPackage(id: string, packageId: string): Promise<{
        message: string;
    }>;
}
