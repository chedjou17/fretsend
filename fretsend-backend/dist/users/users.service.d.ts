import { SupabaseClient } from '@supabase/supabase-js';
import { CreateUserDto, UpdateUserDto } from './users.dto';
export declare class UsersService {
    private readonly db;
    constructor(db: SupabaseClient);
    findAll(search?: string): Promise<any[]>;
    findById(id: string): Promise<any>;
    create(dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        role: string;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<any>;
    updateSelf(userId: string, dto: Pick<UpdateUserDto, 'first_name' | 'last_name' | 'phone'>): Promise<any>;
    checkByEmail(email: string): Promise<{
        found: boolean;
        id: any;
        full_name: string;
    } | {
        found: boolean;
        id?: undefined;
        full_name?: undefined;
    }>;
}
