import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

type ExceptionResponseBody = {
  message?: string | string[];
};

function isExceptionResponseBody(
  value: unknown,
): value is ExceptionResponseBody {
  return typeof value === 'object' && value !== null && 'message' in value;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : this.getExceptionMessage(exceptionResponse);
    }

    response.status(status).json({
      success: false,
      error: message,
    });
  }

  private getExceptionMessage(exceptionResponse: unknown): string {
    if (!isExceptionResponseBody(exceptionResponse)) {
      return 'Erro interno do servidor';
    }

    const { message } = exceptionResponse;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    return message ?? 'Erro interno do servidor';
  }
}
