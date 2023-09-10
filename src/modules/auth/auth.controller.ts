import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entity/user.entity';
import { CurrentUser } from '@core/decorators/user.decorator';
// import JwtTwoFactorGuard from '@core/guard/jwt-two-factor.guard';
// import { PermissionGuard } from '@core/guard/permission.guard';
import { multerOptionsHelper } from '@core/helper/multer-options.helper';
import { QueryPrisma } from '@core/repository/query-buider-frontend/interfaces/Query';
import { Pagination } from '@core/paginate';
import { UAParser } from 'ua-parser-js';

import { RefreshTokenEntity } from './entity/refresh-token.entity';
import { UserLoginDto } from './dto/user-login.dto';

@ApiTags('user')
@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/auth/register')
  register(
    @Body(ValidationPipe)
    registerUserDto: RegisterUserDto,
  ): Promise<UserEntity> {
    return this.authService.create(registerUserDto);
  }

  @Post('/auth/login')
  async login(
    @Req()
    req: Request,
    @Res()
    response: Response,
    @Body()
    userLoginDto: UserLoginDto,
  ) {
    const ua = UAParser(req.headers['user-agent']);

    const refreshTokenPayload: Partial<RefreshTokenEntity> = {
      ip: req.ip,
      userAgent: JSON.stringify(ua),
      browser: ua.browser.name,
      os: ua.os.name,
    };

    const cookiePayload = await this.authService.login(
      userLoginDto,
      refreshTokenPayload,
    );
    response.setHeader('Set-Cookie', cookiePayload);

    return response.status(HttpStatus.NO_CONTENT).json({});
  }

  // @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get('/users')
  findAll(
    @Query()
    userSearchFilterDto: QueryPrisma,
  ): Promise<Pagination<UserEntity>> {
    return this.authService.findAll(userSearchFilterDto);
  }


  // @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Put('/users/:id')
  update(
    @Param('id')
    id: string,
    @Body()
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.authService.update(id, updateUserDto);
  }


  // @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get('/users/:id')
  findOne(
    @Param('id')
    id: string,
  ): Promise<UserEntity> {
    return this.authService.findById(id);
  }


}
