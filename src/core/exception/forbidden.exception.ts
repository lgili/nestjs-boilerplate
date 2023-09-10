import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionTitleList } from '@core/constants/exception-title-list.constants';
import { StatusCodesList } from '@core/constants/status-codes-list.constants';

export class ForbiddenException extends HttpException {
  constructor(message?: string, code?: number) {
    super(
      {
        message: message || ExceptionTitleList.Forbidden,
        code: code || StatusCodesList.Forbidden,
        statusCode: HttpStatus.FORBIDDEN,
        error: true
      },
      HttpStatus.FORBIDDEN
    );
  }
}
