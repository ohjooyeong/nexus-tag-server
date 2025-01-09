import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { Profile } from './entities/profile.entity';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async setUserProfile(
    @CurrentUser() user: any, // 인증된 사용자 정보
    @Body() profileData: Partial<Profile>,
  ) {
    return this.profileService.setUserProfile(user.id, profileData);
  }

  @Post('init-profile')
  async setInitProfile(@Body() userId: string) {
    return this.profileService.initUserProfile(userId);
  }
}
