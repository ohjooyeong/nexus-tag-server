import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    // usernameField 를 email 로 지정하지 않으면
    // default가 username으로 되어있기 때문에 값을 못받아서 401 오류 발생
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password must be provided.');
    }

    let user;
    try {
      user = await this.authService.validateUser(email, password);
    } catch (error) {
      throw new UnauthorizedException('Failed to validate user credentials.');
    }

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Additional checks (optional)
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active.');
    }

    return user;
  }
}
