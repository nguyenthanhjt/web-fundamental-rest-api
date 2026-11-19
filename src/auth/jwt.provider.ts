import { AuthenticationRegistry, JwtBearerProvider, JwtClaims } from "@nestjs/authentication";
import { Injectable } from "@nestjs/common";
import { User } from "../users/entity/users.entity.js";
import { UsersService } from "../users/users.service.js";

@Injectable()
export class JwtProvider extends JwtBearerProvider<User> {
    constructor (private readonly usersService: UsersService, registry: AuthenticationRegistry,) {
        super({ realm: 'my-app' });
        registry.registerProvider(this, { order: 0 });
    }

    async validate(payloads: JwtClaims): Promise<User | null | undefined> {
        if (!payloads.sub) {
            return null;
        }

        const user = await this.usersService.findOne(Number(payloads.sub));
        return user;
    }

}