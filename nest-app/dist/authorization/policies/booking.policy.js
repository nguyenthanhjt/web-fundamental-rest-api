var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Policy } from '@nestjs/authorization';
import { UserRole } from '../../users/enums/user-role.enum.js';
let BookingPolicy = class BookingPolicy {
    update(user, booking) {
        return user.role === UserRole.ADMIN || booking.ownerId === user.id;
    }
    delete(user, booking) {
        return this.update(user, booking);
    }
};
BookingPolicy = __decorate([
    Policy()
], BookingPolicy);
export { BookingPolicy };
//# sourceMappingURL=booking.policy.js.map