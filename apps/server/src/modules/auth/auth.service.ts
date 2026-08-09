import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { hashPassword, verifyPassword } from 'src/common/utils/password.util';
import { UsersRepository } from 'src/modules/users/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService
  ) { }

  async register(dto: RegisterDto) {
    const existingUser = await this.usersRepository.findUserByEmail(dto.email)

    if (existingUser) {
      throw new ConflictException("User already exists.")
    }

    const user = await this.usersRepository.createUser({
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
    const user = await this.usersRepository.findUserByEmail(dto.email);

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
