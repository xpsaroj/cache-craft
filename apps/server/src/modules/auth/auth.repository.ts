import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DRIZZLE } from "src/database/database.constants"
import type { DrizzleDb } from 'src/database/database.types';
import { users } from 'src/database/schema';
import { RegisterUserData } from './auth.types';

@Injectable()
export class AuthRepository {
    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDb,
    ) { }

    async findUserByEmail(email: string) {
        return this.db.query.users.findFirst({
            where: eq(users.email, email),
        });
    }

    async findUserById(id: string) {
        return this.db.query.users.findFirst({
            where: eq(users.id, id),
        });
    }

    async createUser(data: RegisterUserData) {
        const [user] = await this.db
            .insert(users)
            .values({
                ...data
            })
            .returning();

        return user;
    }
}