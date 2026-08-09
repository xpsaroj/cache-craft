import { Injectable } from '@nestjs/common';

import { UsersRepository } from './users.repository';

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
}
