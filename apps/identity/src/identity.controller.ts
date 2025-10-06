import { Body, Controller, Get, Inject, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from '../../../libs/common/src/guards/jwt-auth.guard';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Controller('auth')
export class IdentityController {
  constructor(private readonly identityService: IdentityService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Get()
  getHello(): string {
    return this.identityService.getHello();
  }

  @Post('register')
  @UsePipes(new ValidationPipe())
  register(@Body() registerUser: RegisterUserDto) {
    return this.identityService.registerUser(registerUser);
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  login(@Body() loginUserDto: LoginUserDto) {
    return this.identityService.login(loginUserDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile() { 
    return { message: 'This is a protected route' };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Req() req) {
    // The token is automatically extracted from the header by the guard
    const token = req.headers.authorization.split(' ')[1];
    return this.identityService.logout(token);
  }

  @Get('test-redis')
  async testRedis() {
    console.log('--- Testing Redis Connection ---');
    try {
      await this.cacheManager.set('test-key', 'hello-redis', 10000);
      console.log('Set successful. Trying to get key...');
      const value = await this.cacheManager.get('test-key');
      console.log('Got value from Redis:', value);
      return { value };
    } catch (error) {
      console.error('Error testing Redis:', error);
      return { error: error.message };
    }
  }
}
