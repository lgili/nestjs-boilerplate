import { HttpException, HttpStatus } from '@nestjs/common';

import { ExceptionTitleList } from '@core/constants/exception-title-list.constants';
import { StatusCodesList } from '@core/constants/status-codes-list.constants';

export class NotFoundException extends HttpException {
  constructor(message?: string, code?: number) {
    super(
      {
        message: message || ExceptionTitleList.NotFound,
        code: code || StatusCodesList.NotFound,
        statusCode: HttpStatus.NOT_FOUND,
        error: true
      },
      HttpStatus.NOT_FOUND
    );
  }
}
