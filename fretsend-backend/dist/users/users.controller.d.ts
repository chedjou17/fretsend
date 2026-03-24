import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './users.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(search?: string): Promise<any[]>;
    checkByEmail(email: string): Promise<{
        found: boolean;
        id: any;
        full_name: string;
    } | {
        found: boolean;
        id?: undefined;
        full_name?: undefined;
    }>;
    updateSelf(userId: string, dto: UpdateUserDto): Promise<any>;
    findById(id: string): Promise<any>;
    create(dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        role: string;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<any>;
}
