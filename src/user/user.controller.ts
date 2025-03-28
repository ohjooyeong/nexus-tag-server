import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getUserWithProfile(@CurrentUser() user: User) {
    const userProfile = await this.userService.getUserWithProfile({
      id: user.id,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Profile retrieved successfully',
      data: userProfile,
    };
  }

  @Post('password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @CurrentUser() user: User,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    const updatedUser = await this.userService.updateUserPassword(
      user.id,
      body.currentPassword,
      body.newPassword,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Password updated successfully',
      data: updatedUser,
    };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateUserProfile(
    @CurrentUser() user: User,
    @Body() body: { username: string },
  ) {
    const updatedUser = await this.userService.updateUserProfile(
      user.id,
      // body.profileImg,
      body.username,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Profile updated successfully',
      data: updatedUser,
    };
  }
}
