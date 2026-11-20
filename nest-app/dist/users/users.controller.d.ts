import { CreateUserDto } from './dto/user.dto.js';
import { UsersService } from './users.service.js';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(dto: CreateUserDto): Promise<{
        id: number;
        username: string;
        role: import("./enums/user-role.enum.js").UserRole;
    }>;
}
