import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from './user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) { }

  async registerUser(registerUserDto: RegisterUserDto): Promise<User> {

    const existenteUser = await this.userRepository.findOneBy({ email: registerUserDto.email });
    if (existenteUser) {
      throw new ConflictException('El email ya está en uso.');
    }
    const newUser = this.userRepository.create(registerUserDto);
    return this.userRepository.save(newUser);
  }

  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string, user: User }> {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOneBy({ email: loginUserDto.email });
    if (!user) {
      throw new ConflictException('Credenciales inválidas.');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const payload = { id: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    user.password = '';
    return { accessToken, user };

  }

  async logout(accessToken: string) {
    // Decode the token to get its expiration time
    const decodedToken = this.jwtService.decode(accessToken) as { exp: number };
    if (!decodedToken || !decodedToken.exp) {
      return; // Invalid token
    }

    // Calculate the remaining time-to-live (TTL) in seconds
    const expirationTime = decodedToken.exp;
    const currentTime = Math.floor(Date.now() / 1000);
    const ttl = expirationTime - currentTime;

    console.log({ ttl });
    if (ttl > 0) {
      // Add the token to the blocklist in Redis with the remaining time as its TTL
      await this.cacheManager.set(`blocklist:${accessToken}`, 'true', ttl * 1000);
      const value = await this.cacheManager.get(`blocklist:${accessToken}`);
      console.log('Got value from Redis:', value);
      console.log('Token added to blocklist');
    }

    return { message: 'Logout successful' };
  }

  getHello(): string {
    return 'Hello World!';
  }
}
