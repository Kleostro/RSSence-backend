import { Request, Response } from 'express';

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  public catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode = this.getStatus(exception);
    const message = this.getMessage(exception);

    response.status(statusCode).json({
      statusCode,
      path: request.url,
      method: request.method,
      message,
    });
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && 'message' in response) {
        if (typeof response.message === 'string') {
          return response.message;
        }
        if (Array.isArray(response.message)) {
          return response.message.join(', ');
        }
      }
    }
    return 'Server error';
  }
}
