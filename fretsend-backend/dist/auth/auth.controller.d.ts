import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    refresh(dto: RefreshTokenDto): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    getMe(userId: string): Promise<any>;
    logout(userId: string): Promise<{
        message: string;
    }>;
}
