import { BadRequestException, Injectable } from '@nestjs/common';

import { UsersRepository } from './users.repository';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
    ) { }

    async getUserByEmail(email: string) {
        return this.usersRepository.findUserByEmail(email);
    }

    async getUserById(id: string) {
        return this.usersRepository.findUserById(id);
    }

    async updateUser(id: string, dto: UpdateUserDto) {
        if (dto.email === undefined && dto.name === undefined) {
            throw new BadRequestException(
                'At least one field (email or name) must be provided.',
            );
        }

        return this.usersRepository.updateUser(id, dto);
    }
}
