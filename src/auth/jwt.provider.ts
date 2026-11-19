import { AuthenticationRegistry, JwtBearerProvider, JwtClaims } from "@nestjs/authentication";
import { Injectable } from "@nestjs/common";
import { Users } from "../users/entity/users.entity.js";
import { UsersService } from "../users/users.service.js";

@Injectable()
export class JwtProvider extends JwtBearerProvider<Users> {
    constructor (private readonly usersService: UsersService, registry: AuthenticationRegistry,) {
        super({ realm: 'my-app' });
        registry.registerProvider(this, { order: 0 });
    }

    async validate(payloads: JwtClaims): Promise<Users | null | undefined> {
        if (!payloads.sub) {
            return null;
        }

        const user = await this.usersService.findOne(payloads.sub);
        return user;
    }

}