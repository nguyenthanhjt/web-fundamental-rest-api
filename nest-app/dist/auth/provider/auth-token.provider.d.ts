import { TokenService } from '@nestjs/authentication';
export declare class AuthTokenProvider {
    private readonly tokenService;
    constructor(tokenService: TokenService);
    issue(user: {
        id: number;
    }): Promise<import("@nestjs/authentication").TokenPair>;
}
