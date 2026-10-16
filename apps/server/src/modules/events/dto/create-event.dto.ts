import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateEventDto {
  @IsUUID()
  venueId!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  @MinLength(10)
  description?: string;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;

  @IsDateString()
  bookingOpensAt!: string;

  @IsDateString()
  bookingClosesAt!: string;
}