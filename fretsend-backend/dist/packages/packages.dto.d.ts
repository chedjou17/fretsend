export declare class CreatePackageDto {
    sender_name: string;
    sender_phone: string;
    sender_email?: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_email?: string;
    origin_agency_id: string;
    destination_agency_id: string;
    transport_type: 'air' | 'sea';
    weight_kg: number;
    length_cm?: number;
    width_cm?: number;
    height_cm?: number;
    declared_value?: number;
    description?: string;
    notes?: string;
    is_fragile?: boolean;
    is_insured?: boolean;
    is_urgent?: boolean;
}
export declare class UpdateStatusDto {
    status: string;
    agency_id?: string;
    note?: string;
    latitude?: number;
    longitude?: number;
}
export declare class PackageQueryDto {
    search?: string;
    status?: string;
    transport_type?: string;
    agency_id?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
}
