
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { ValidationError } from 'class-validator';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const statusCode =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse =
            exception instanceof HttpException
                ? exception.getResponse()
                : null;

        const body =
            typeof exceptionResponse === 'object' &&
                exceptionResponse !== null
                ? (exceptionResponse as Record<string, unknown>)
                : {};

        const rawMessage = body.message;
        const errors = Array.isArray(body.errors)
            ? body.errors
            : undefined;

        const isValidationError =
            errors !== undefined || Array.isArray(rawMessage);

        const message = isValidationError
            ? 'Validation failed.'
            : typeof rawMessage === 'string'
                ? rawMessage
                : typeof exceptionResponse === 'string'
                    ? exceptionResponse
                    : statusCode >= 500
                        ? 'Internal server error.'
                        : 'Request failed.';

        response.status(statusCode).json({
            success: false,
            statusCode,
            message,
            ...(errors && { errors }),
            timestamp: new Date().toISOString(),
            path: request.originalUrl,
        });
    }
}


export function formatValidationErrors(
    errors: ValidationError[],
    parent = '',
): { field: string; messages: string[] }[] {
    return errors.flatMap((error) => {
        const field = parent
            ? `${parent}.${error.property}`
            : error.property;

        const current = error.constraints
            ? [{
                field,
                messages: Object.values(error.constraints),
            }]
            : [];

        return [
            ...current,
            ...formatValidationErrors(error.children ?? [], field),
        ];
    });
}