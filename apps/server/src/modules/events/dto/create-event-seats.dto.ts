import {
    IsArray,
    IsInt,
    IsNumber,
    IsString,
    MaxLength,
    Min,
    ValidateNested,
    ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateSeatRowDto {
    @IsString()
    @MaxLength(10)
    row!: string;

    @IsInt()
    @Min(1)
    seatCount!: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    price!: number;
}

export class CreateEventSeatsDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateSeatRowDto)
    rows!: CreateSeatRowDto[];
}