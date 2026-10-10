import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DRIZZLE } from "src/database/database.constants";
import type { DrizzleDb } from "src/database/database.types";
import { users } from "src/database/schema";
import type { RegisterUserData, UpdateUserData } from "./users.types";


@Injectable()
export class UsersRepository {
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
            columns: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        })
    }

    async createUser(data: RegisterUserData) {
        const [user] = await this.db
            .insert(users)
            .values({
                ...data
            })
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
            });

        return user;
    }

    async updateUser(id: string, data: UpdateUserData) {
        const [user] = await this.db
            .update(users)
            .set(data)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
            });

        return user;
    }
}