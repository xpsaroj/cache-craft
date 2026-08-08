import { IsEmail, IsString, MinLength, MaxLength, IsEnum } from 'class-validator';

import { type UserRole, userRoleEnum } from 'src/database/schema';

export class RegisterDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(8)
    @MaxLength(128)
    password!: string;

    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name!: string;

    @IsEnum(userRoleEnum.enumValues)
    role!: UserRole
}