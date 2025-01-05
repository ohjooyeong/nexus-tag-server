import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guard/local.guard';
import { CurrentUser } from './current-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { Response } from 'express';
import { JwtAuthGuard } from './guard/jwt.guard';
import { Profile } from 'src/profile/entities/profile.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.authService.login(user, response);
    response.send(user);

    return data;
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUser(@CurrentUser() user: User) {
    return user;
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getUserWithProfile(@CurrentUser() user: User) {
    return this.authService.getUserWithProfile({ id: user.id });
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  async setUserProfile(
    @CurrentUser() user: any, // 인증된 사용자 정보
    @Body() profileData: Partial<Profile>,
  ) {
    return this.authService.setUserProfile(user.id, profileData);
  }
}
