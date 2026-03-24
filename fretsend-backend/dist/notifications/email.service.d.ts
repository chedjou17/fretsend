import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly config;
    private readonly logger;
    private readonly apiKey;
    private readonly from;
    private readonly appUrl;
    constructor(config: ConfigService);
    send(to: string, subject: string, html: string): Promise<void>;
    sendPaymentLink(pkg: any, paymentToken: string): Promise<void>;
    sendSenderConfirmation(pkg: any, senderPassword?: string): Promise<void>;
    sendRecipientNotification(pkg: any, recipientPassword?: string): Promise<void>;
    sendAvailableNotification(pkg: any): Promise<void>;
    sendStatusUpdate(pkg: any, status: string, title: string, description: string): Promise<void>;
    private template;
    private formatPrice;
    private httpPost;
}
