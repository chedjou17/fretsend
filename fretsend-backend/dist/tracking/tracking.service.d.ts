import { SupabaseClient } from '@supabase/supabase-js';
export declare class TrackingService {
    private readonly db;
    constructor(db: SupabaseClient);
    getEvents(packageId: string): Promise<any[]>;
    getGlobalStats(): Promise<any>;
    getMonthlyStats(): Promise<any[]>;
    getAgencyStats(): Promise<any[]>;
}
