import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { LoginDto, RegisterDto } from './auth.dto';
export declare class AuthService {
    private readonly db;
    private readonly jwt;
    private readonly config;
    private readonly logger;
    constructor(db: SupabaseClient, jwt: JwtService, config: ConfigService);
    login(dto: LoginDto): Promise<{
        profile: {
            id: any;
            email: any;
            first_name: any;
            last_name: any;
            role: any;
            agency_id: any;
            agency: any;
            phone: any;
        };
        access_token: string;
        refresh_token: string;
        expires_in: any;
    }>;
    register(dto: RegisterDto): Promise<{
        message: string;
    }>;
    refresh(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    getMe(userId: string): Promise<any>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    private generateTokens;
}
