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
  ValidationPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UAParser } from 'ua-parser-js';

import { AuthService } from 'src/modules/auth/auth.service';
import { CreateUserDto } from 'src/modules/auth/dto/create-user.dto';
import { RegisterUserDto } from 'src/modules/auth/dto/register-user.dto';
import { UpdateUserDto } from 'src/modules/auth/dto/update-user.dto';
import { UserSearchFilterDto } from 'src/modules/auth/dto/user-search-filter.dto';
import { UserEntity } from 'src/modules/auth/model/user.entity';

import { GetUser } from 'src/common/decorators/get-user.decorator';
import { multerOptionsHelper } from 'src/common/helper/multer-options.helper';
import { Pagination } from 'src/paginate';
import { UserSerializer } from './model/user.serializer';
;

@ApiTags('user')
@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/auth/register')
  register(
    @Body(ValidationPipe)
    registerUserDto: RegisterUserDto
  ): Promise<UserSerializer> {
    return this.authService.register(registerUserDto);
  }
 
  
  
  // @Get('/auth/profile')
  // profile(
  //   @GetUser()
  //   user: UserEntity
  // ): Promise<UserSerializer> {
  //   return this.authService.get(user);
  // }

  
  // @Get('/users')
  // findAll(
  //   @Query()
  //   userSearchFilterDto: UserSearchFilterDto
  // ): Promise<Pagination<UserSerializer>> {
  //   return this.authService.findAll(userSearchFilterDto);
  // }
  
  // @Post('/users')
  // create(
  //   @Body(ValidationPipe)
  //   createUserDto: CreateUserDto
  // ): Promise<User> {
  //   return this.authService.create(createUserDto);
  // }

  
  // @Put('/users/:id')
  // update(
  //   @Param('id')
  //   id: string,
  //   @Body()
  //   updateUserDto: UpdateUserDto
  // ): Promise<UserSerializer> {
  //   return this.authService.update(+id, updateUserDto);
  // }

  
  // @Get('/users/:id')
  // findOne(
  //   @Param('id')
  //   id: string
  // ): Promise<UserSerializer> {
  //   return this.authService.findById(+id);
  // }

    
}
