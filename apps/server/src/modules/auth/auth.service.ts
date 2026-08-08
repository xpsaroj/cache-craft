import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { hashPassword, verifyPassword } from 'src/common/utils/password.util';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService
  ) { }

  async register(dto: RegisterDto) {
    const existingUser = await this.authRepository.findUserByEmail(dto.email)

    if (existingUser) {
      throw new ConflictException("User already exists.")
    }

    const user = await this.authRepository.createUser({
      ...dto,
      passwordHash: await hashPassword(dto.password),
    })

    const payload = {
      sub: user.id,
      role: user.role,
    }

    const accessToken = await this.jwtService.signAsync(payload)

    return { accessToken }
  }

  async login(dto: LoginDto) {
    const user = await this.authRepository.findUserByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordMatch = await verifyPassword(dto.password, user.passwordHash)

    if (!passwordMatch) {
      throw new UnauthorizedException("Invalid credentials.")
    }

    const payload = {
      sub: user.id,
      role: user.role,
    }

    const accessToken = await this.jwtService.signAsync(payload)

    return { accessToken }
  }
}
