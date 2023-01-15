import {
  HttpStatus,
  Inject,
  Injectable,
  UnprocessableEntityException
} from '@nestjs/common';


import * as config from 'config';
import { existsSync, unlinkSync } from 'fs';


import { UserSearchFilterDto } from 'src/modules/auth/dto/user-search-filter.dto';
import { UserEntity } from 'src/modules/auth/model/user.entity';

import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';
import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
import { ValidationPayloadInterface } from 'src/common/interfaces/validation-error.interface';
import { CustomHttpException } from 'src/exception/custom-http.exception';
import { ForbiddenException } from 'src/exception/forbidden.exception';
import { NotFoundException } from 'src/exception/not-found.exception';
import { UnauthorizedException } from 'src/exception/unauthorized.exception';
import { IUserRepository } from 'src/modules/auth/i-user.repository';
import { UserStatusEnum } from 'src/modules/auth/user-status.enum';

import { Pagination } from 'src/paginate';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserSerializer } from './model/user.serializer';


const throttleConfig = config.get('throttle.login');
const appConfig = config.get('app');


@Injectable()
export class AuthService {
  constructor(    
    private readonly userRepository: IUserRepository,
  ) {}

  
  /**
   * add new user
   * @param createUserDto
   */
  async register(
    registerUserDto: RegisterUserDto
  ): Promise<UserSerializer> {    
    
    const user = new UserEntity(registerUserDto)
    console.log(user)
    const userSaved = await this.userRepository.create(user);    
    console.log(userSaved)
    return user;
  }

 
  /**
   * get user profile
   * @param user
   */
  // async get(user: UserEntity): Promise<User> {
  //   return this.userRepository.transform(user, {
  //     groups: ownerUserGroupsForSerializing
  //   });
  // }

  /**
   * Get user By Id
   * @param id
   */
  // async findById(id: number): Promise<User> {
  //   return this.userRepository.get(id, ['role'], {
  //     groups: [
  //       ...adminUserGroupsForSerializing,
  //       ...ownerUserGroupsForSerializing
  //     ]
  //   });
  // }



}
