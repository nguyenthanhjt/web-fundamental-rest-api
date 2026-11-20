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
import { CreateReviewDto } from './dto/create-review.dto';
import { ReplaceReviewDto } from './dto/replace-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('services/:serviceId/reviews')
  findAll(@Param('serviceId') serviceId: string) {
    return this.reviewsService.findByService(serviceId);
  }

  @Post('services/:serviceId/reviews')
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles([Role.User, Role.Admin])
  create(
    @CurrentUser() user: CurrentUserData,
    @Param('serviceId') serviceId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(user.sub, serviceId, dto);
  }

  @Get('reviews/:id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Put('reviews/:id')
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles([Role.User, Role.Admin])
  replace(
    @Param('id') id: string,
    @Body() dto: ReplaceReviewDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.reviewsService.replace(id, dto, user);
  }

  @Patch('reviews/:id')
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles([Role.User, Role.Admin])
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.reviewsService.update(id, dto, user);
  }

  @Delete('reviews/:id')
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles([Role.User, Role.Admin])
  @HttpCode(204)
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    this.reviewsService.remove(id, user);
  }
}
