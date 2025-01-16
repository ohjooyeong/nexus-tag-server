import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guard/local.guard';
import { CurrentUser } from './current-user.decorator';
import { User } from 'src/entities/user.entity';
import { Response } from 'express';
import { JwtAuthGuard } from './guard/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK) // 로그인 성공 시 200 OK 응답
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(user, response);
    return response.status(200).json({
      statusCode: 200,
      message: 'Login Successfully',
      data: result,
    });
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    await this.authService.logout(response);
    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully logged out',
      data: null,
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'User registered successfully',
      data: user,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getUserWithProfile(@CurrentUser() user: User) {
    const userProfile = await this.authService.getUserWithProfile({
      id: user.id,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Profile retrieved successfully',
      data: userProfile,
    };
  }

  @Post('resend-verification-email')
  async resendVerificationEmail(@Body('email') email: string) {
    const user = await this.authService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    await this.authService.resendVerificationEmail(user);
    return {
      statusCode: HttpStatus.OK,
      message: 'Verification email has been resent.',
      data: null,
    };
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token) {
      throw new UnauthorizedException('Token is required.');
    }

    await this.authService.verifyEmail(token);
    return { message: 'Email successfully verified. You can now log in.' };
  }
}
