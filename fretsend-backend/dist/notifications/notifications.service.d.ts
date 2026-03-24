import { SupabaseClient } from '@supabase/supabase-js';
export declare class NotificationsService {
    private readonly db;
    private readonly logger;
    constructor(db: SupabaseClient);
    notifyCreated(pkg: any): Promise<void>;
    notifyStatusChange(pkg: any, status: string): Promise<void>;
    findAll(packageId?: string): Promise<any[]>;
    private save;
}
