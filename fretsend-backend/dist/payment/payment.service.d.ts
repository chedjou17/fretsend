import { SupabaseClient } from '@supabase/supabase-js';
import { EmailService } from '../notifications/email.service';
import { TrackingGateway } from '../websocket/tracking.gateway';
export declare class PaymentService {
    private readonly db;
    private readonly emailService;
    private readonly trackingGateway;
    private readonly logger;
    constructor(db: SupabaseClient, emailService: EmailService, trackingGateway: TrackingGateway);
    generatePaymentToken(packageId: string): Promise<string>;
    verifyToken(token: string): Promise<{
        token: string;
        status: any;
        tracking_number: any;
        sender_name: any;
        recipient_name: any;
        transport_type: any;
        weight_kg: any;
        price: any;
        currency: any;
        origin_city: any;
        destination_city: any;
        origin_agency_name: any;
        destination_agency_name: any;
    }>;
    processAction(token: string, action: 'paid' | 'unpaid' | 'problem'): Promise<{
        message: string;
        status: string;
    }>;
}
