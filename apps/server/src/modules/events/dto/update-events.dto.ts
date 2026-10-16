import {
    IsDateString,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    MinLength
} from 'class-validator';

export class UpdateEventsDto {
    @IsOptional()
    @IsUUID()
    venueId?: string;

    @IsOptional()
    @IsString()
    @MinLength(5)
    @MaxLength(255)
    title?: string;

    @IsOptional()
    @IsString()
    @MaxLength(4000)
    @MinLength(10)
    description?: string;

    @IsOptional()
    @IsDateString()
    startsAt?: string;

    @IsOptional()
    @IsDateString()
    endsAt?: string;

    @IsOptional()
    @IsDateString()
    bookingOpensAt?: string;

    @IsOptional()
    @IsDateString()
    bookingClosesAt?: string;
}