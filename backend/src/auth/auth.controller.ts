import { Controller, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Throttle } from '@nestjs/throttler';
import { RegisterDto } from './dto/register.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('register')
  @ApiOperation({
    summary: 'User registration',
    description: 'Creates a new user and returns a JWT token',
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Throttle({ default: { limit: 1000, ttl: 60 * 1000 } })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
