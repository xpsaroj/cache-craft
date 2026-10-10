import { UserRole } from "src/database/schema";

export interface RegisterUserData {
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole
}

export interface UpdateUserData {
    email: string;
    name: string;
}