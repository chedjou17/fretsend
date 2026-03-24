import { SupabaseClient } from '@supabase/supabase-js';
import { CreatePackageDto, UpdateStatusDto, PackageQueryDto } from './packages.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../notifications/email.service';
import { TrackingGateway } from '../websocket/tracking.gateway';
export declare class PackagesService {
    private readonly db;
    private readonly notifications;
    private readonly emailService;
    private readonly trackingGateway;
    private readonly logger;
    constructor(db: SupabaseClient, notifications: NotificationsService, emailService: EmailService, trackingGateway: TrackingGateway);
    findAll(query: PackageQueryDto, userId: string, userRole: string, userAgencyId?: string): Promise<{
        data: any[];
        count: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findByTracking(trackingNumber: string): Promise<any>;
    findById(id: string, userId: string, userRole: string): Promise<any>;
    checkUserByEmail(email: string): Promise<{
        found: boolean;
        id: any;
        full_name: string;
    } | {
        found: boolean;
        id?: undefined;
        full_name?: undefined;
    }>;
    create(dto: CreatePackageDto & {
        sender_id?: string;
        recipient_id?: string;
    }, userId: string): Promise<any>;
    private handlePostCreation;
    updateStatus(id: string, dto: UpdateStatusDto, userId: string): Promise<{
        message: string;
    }>;
    getStats(userRole: string, agencyId?: string): Promise<{
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
}
