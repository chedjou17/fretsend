import { SupabaseClient } from '@supabase/supabase-js';
import { CreateShipmentDto } from './shipments.dto';
export declare class ShipmentsService {
    private readonly db;
    constructor(db: SupabaseClient);
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any>;
    create(dto: CreateShipmentDto, userId: string): Promise<any>;
    updateStatus(id: string, status: string): Promise<any>;
    addPackage(shipmentId: string, packageId: string): Promise<{
        message: string;
    }>;
}
