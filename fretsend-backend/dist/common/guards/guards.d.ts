import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { SupabaseClient } from '@supabase/supabase-js';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly db;
    constructor(config: ConfigService, db: SupabaseClient);
    validate(payload: {
        sub: string;
        email: string;
        role: string;
        agency_id?: string;
    }): Promise<{
        id: any;
        email: any;
        role: any;
        agency_id: any;
        is_active: any;
        first_name: any;
        last_name: any;
    }>;
}
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | import("rxjs").Observable<boolean>;
    handleRequest(err: any, user: any): any;
}
export declare class RolesGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
export {};
