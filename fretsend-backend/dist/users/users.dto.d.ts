export declare class CreateUserDto {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role: string;
    agency_id?: string;
}
export declare class UpdateUserDto {
    first_name?: string;
    last_name?: string;
    phone?: string;
    role?: string;
    agency_id?: string;
    is_active?: boolean;
}
