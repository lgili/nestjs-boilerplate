import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionTitleList } from '@core/constants/exception-title-list.constants';
import { StatusCodesList } from '@core/constants/status-codes-list.constants';

export class CustomHttpException extends HttpException {
  constructor(message?: string, statusCode?: number, code?: number) {
    super(
      {
        message: message || ExceptionTitleList.BadRequest,
        code: code || StatusCodesList.BadRequest,
        statusCode: statusCode || HttpStatus.BAD_REQUEST,
        error: true
      },
      statusCode || HttpStatus.BAD_REQUEST
    );
  }
}
