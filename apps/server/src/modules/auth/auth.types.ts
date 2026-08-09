import { UserRole } from "src/database/schema";

export interface AuthenticatedUser {
    id: string;
    role: UserRole;
}