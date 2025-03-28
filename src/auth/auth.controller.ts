import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guard/local.guard';
import { CurrentUser } from './current-user.decorator';
import { User } from 'src/entities/user.entity';
import { Request } from 'express';
import { JwtAuthGuard } from './guard/jwt.guard';
import { GoogleOauthGuard } from './guard/google-oauth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@CurrentUser() user: User) {
    const result = await this.authService.login(user);
    return {
      statusCode: 200,
      message: 'Login Successfully',
      data: result,
    };
  }

  @Post('logout')
  async logout() {
    await this.authService.logout();
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

  @Get('status')
  async getStatus(@Req() request: Request) {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: HttpStatus.OK,
        message: 'loggedIn false',
        data: { loggedIn: false },
      };
    }

    const token = authHeader.split(' ')[1];

    try {
      const user = await this.authService.validateToken(token);
      return {
        statusCode: HttpStatus.OK,
        message: 'loggedIn true',
        data: { loggedIn: true, user },
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.OK,
        message: 'loggedIn false',
        data: { loggedIn: false },
      };
    }
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

  @Post('verify-email')
  async verifyEmail(@Body('token') token: string) {
    if (!token) {
      throw new UnauthorizedException('Token is required.');
    }

    await this.authService.verifyEmail(token);
    return {
      statusCode: HttpStatus.OK,
      message: 'Email successfully verified. You can now log in.',
      data: null,
    };
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req, @Res() res) {
    try {
      const loginResult = await this.authService.googleLogin(req.user);
      const clientDomain = this.configService.get('CLIENT_DOMAIN');

      return res.redirect(
        `${clientDomain}/login/google/callback?` +
          `token=${loginResult.access_token}` +
          `&expires_at=${loginResult.expires_at}` +
          `&expires_in=${loginResult.expires_in}`,
      );
    } catch (error) {
      const clientDomain = this.configService.get('CLIENT_DOMAIN');
      return res.redirect(`${clientDomain}/login?error=Authentication failed`);
    }
  }
}
