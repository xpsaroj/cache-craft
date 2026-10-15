import type { PaginatedResult } from '../interfaces/paginated-result.interface';

interface PaginationParams {
    page: number;
    limit: number;
    totalItems: number;
}

export function createPaginatedResult<T>(
    items: T[],
    { page, limit, totalItems }: PaginationParams,
): PaginatedResult<T> {
    const totalPages = Math.ceil(totalItems / limit);

    return {
        items,
        pagination: {
            page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
}