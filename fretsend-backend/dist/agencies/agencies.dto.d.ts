export declare class CreateAgencyDto {
    name: string;
    country: 'FR' | 'CM';
    city: string;
    address: string;
    phone?: string;
    email?: string;
    is_hub?: boolean;
    manager_id?: string;
    latitude?: number;
    longitude?: number;
}
