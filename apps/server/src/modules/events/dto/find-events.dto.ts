import { IntersectionType } from '@nestjs/mapped-types';
import {
    IsDateString,
    IsIn,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
} from 'class-validator';

import { eventStatusEnum } from 'src/database/schema';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

class FindEventFiltersDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    title?: string;

    @IsOptional()
    @IsString()
    @MaxLength(4000)
    description?: string;

    @IsOptional()
    @IsDateString()
    startsAfter?: string;

    @IsOptional()
    @IsDateString()
    endsBefore?: string;

    @IsOptional()
    @IsIn(eventStatusEnum.enumValues)
    status?: (typeof eventStatusEnum.enumValues)[number];

    @IsOptional()
    @IsUUID()
    venueId?: string;

    @IsOptional()
    @IsUUID()
    organizerId?: string;
}

export class FindEventsDto extends IntersectionType(
    PaginationQueryDto,
    FindEventFiltersDto,
) { }