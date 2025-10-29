import {HttpStatus} from '@nestjs/common';

export class ApiResponse<T> {
    data: T | null;
    message: string;
    success: boolean;
    statusCode: number;

    constructor(
        data: T | null,
        message: string,
        success: boolean,
        statusCode: number,
    ) {
        this.data = data;
        this.message = message;
        this.success = success;
        this.statusCode = statusCode;
    }

    static success<T>(
        data: T,
        message: string = 'success',
        status = HttpStatus.OK,
    ): ApiResponse<T> {
        return new ApiResponse<T>(data, message, true, status);
    }

    static error<T>(message: string, statusCode: number): ApiResponse<T> {
        return new ApiResponse<T>(null, message, false, statusCode);
    }
}
