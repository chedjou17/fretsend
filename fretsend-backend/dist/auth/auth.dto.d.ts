export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
}
export declare class RefreshTokenDto {
    refresh_token: string;
}
