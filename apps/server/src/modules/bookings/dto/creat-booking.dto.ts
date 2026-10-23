import {
    ArrayMinSize,
    IsArray,
    IsUUID,
} from 'class-validator';

export class CreateBookingDto {
    @IsArray()
    @ArrayMinSize(1)
    @IsUUID('all', { each: true })
    seatIds!: string[];
}