import { TrackingService } from './tracking.service';
export declare class TrackingController {
    private readonly trackingService;
    constructor(trackingService: TrackingService);
    getGlobalStats(): Promise<any>;
    getMonthlyStats(): Promise<any[]>;
    getAgencyStats(): Promise<any[]>;
    getEvents(packageId: string): Promise<any[]>;
}
