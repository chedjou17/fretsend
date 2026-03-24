import { PaymentService } from './payment.service';
declare class PaymentActionDto {
    action: 'paid' | 'unpaid' | 'problem';
}
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    verify(token: string): Promise<{
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
    process(token: string, dto: PaymentActionDto): Promise<{
        message: string;
        status: string;
    }>;
}
export {};
