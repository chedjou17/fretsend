export declare class CreateShipmentDto {
    transport_type: 'air' | 'sea';
    origin_agency_id: string;
    destination_agency_id: string;
    departure_date?: string;
    estimated_arrival_date?: string;
    notes?: string;
}
