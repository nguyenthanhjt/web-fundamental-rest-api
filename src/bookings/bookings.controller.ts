// bookings/bookings.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('bookings')
@UseGuards(JWTAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get()
  @Roles([Role.User, Role.Admin])
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.bookings.findAll(user);
  }

  @Get(':id')
  @Roles([Role.User, Role.Admin])
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.bookings.findOne(id, user);
  }

  @Post()
  @Roles([Role.User, Role.Admin])
  create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateBookingDto) {
    return this.bookings.create(user.sub, dto);
  }

  @Put(':id')
  @Roles([Role.User, Role.Admin])
  replace(
    @Param('id') id: string,
    @Body() dto: CreateBookingDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.bookings.replace(id, dto, user);
  }

  @Patch(':id')
  @Roles([Role.User, Role.Admin])
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBookingDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.bookings.update(id, dto, user);
  }

  @Delete(':id')
  @Roles([Role.User, Role.Admin])
  @HttpCode(204)
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    this.bookings.remove(id, user);
  }
}
