import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateUserDto {
    @IsEmail()
    @IsOptional()
    email!: string;

    @IsString()
    @MinLength(3)
    @MaxLength(100)
    @IsOptional()
    name!: string;
}