import {
  HttpStatus,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as config from 'config';
import { existsSync, unlinkSync } from 'fs';
import { SignOptions } from 'jsonwebtoken';

import {
  GROUP_ADMIN,
  GROUP_DEFAULT,
  GROUP_USER,
  UserEntity,
} from './entity/user.entity';
import { UserStatusEnum } from './user-status.enum';
import { ExceptionTitleList } from '@core/constants/exception-title-list.constants';
import { StatusCodesList } from '@core/constants/status-codes-list.constants';
import { ValidationPayloadInterface } from '@core/types';
import { QueryPrisma } from '@core/repository/query-buider-frontend/interfaces/Query';
// import { QueryString } from 'src/common/repository/query-buider-frontend/Querybuilder';
import { DeepPartial } from '@core/repository/type.repository';
import { CustomHttpException } from '@core/exception/custom-http.exception';
import { ForbiddenException } from '@core/exception/forbidden.exception';
import { NotFoundException } from '@core/exception/not-found.exception';
import { UnauthorizedException } from '@core/exception/unauthorized.exception';
import { Pagination } from '@core/paginate';
import { RefreshTokenEntity } from './entity/refresh-token.entity';

import { UserLoginDto } from './dto/user-login.dto';
import { UserRepository } from './user.repository';

const throttleConfig = config.get('throttle.login');
const jwtConfig = config.get('jwt');
const appConfig = config.get('app');

const isSameSite =
  appConfig.sameSite !== null
    ? appConfig.sameSite
    : process.env.IS_SAME_SITE === 'true';

const BASE_OPTIONS: SignOptions = {
  issuer: appConfig.appUrl,
  audience: appConfig.frontendUrl,
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwt: JwtService,
  ) {}


  /**
   * add new user
   * @param createUserDto
   */
  async create(createUserDto: DeepPartial<UserEntity>): Promise<UserEntity> {
    const user = new UserEntity(createUserDto);
    const token = await this.generateUniqueToken(12);

    if (!user.status) {     // normal user creation
      const currentDateTime = new Date();
      currentDateTime.setHours(currentDateTime.getHours() + 1);
      user.tokenValidityDate = currentDateTime;
      user.status = UserStatusEnum.INACTIVE;
    }

    // just possible create normal user from register
    user.token = token;
    user.salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, user.salt);

    const userSaved = await this.userRepository.create({
      data: user,
      cls: UserEntity,
    });

    if (userSaved) {
      const registerProcess = createUserDto.status;
      const subject = registerProcess ? 'Account created' : 'Set Password';
      const link = registerProcess ? `verify/${token}` : `reset/${token}`;

      const slug = registerProcess
        ? 'activate-account'
        : 'new-user-set-password';
      const linkLabel = registerProcess ? 'Activate Account' : 'Set Password';
      return userSaved;
    }
    throw new CustomHttpException(
      `Error to create new user`,
      HttpStatus.BAD_REQUEST,
      StatusCodesList.InternalServerError,
    );
  }

  /**
   * Login user by username and password
   * @param userLoginDto
   * @param refreshTokenPayload
   */
  async login(
    userLoginDto: UserLoginDto,
    refreshTokenPayload: Partial<RefreshTokenEntity>,
  ): Promise<string[]> {
    const usernameIPkey = `${userLoginDto.username}_${refreshTokenPayload.ip}`;

    let retrySecs = 0;



    if (retrySecs > 0) {
      throw new CustomHttpException(
        `tooManyRequest-{"second":"${String(retrySecs)}"}`,
        HttpStatus.TOO_MANY_REQUESTS,
        StatusCodesList.TooManyTries,
      );
    }

    const [user, error, code] = await this.verifyUser(userLoginDto);

    if (!user) {
      throw new UnauthorizedException(error, code);
    }

    const accessToken = await this.generateAccessToken(user);
    let refreshToken = null;



    return this.buildResponsePayload(accessToken, refreshToken);
  }

  /**
   * update user
   * @param id
   * @param updateUserDto
   */
  async update(
    id: string,
    updateUserDto: Partial<UserEntity>,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findById({
      id: id,
    });
    const errorPayload: ValidationPayloadInterface[] = [];

    if (updateUserDto.email) {
      const newEmail = await this.userRepository.findBy({
        fieldName: 'email',
        value: updateUserDto.email,
      });

      if (newEmail) {
        errorPayload.push({
          property: 'email',
          constraints: {
            unique: 'already taken',
          },
        });
      }
    }

    if (updateUserDto.username) {
      const newUsername = await this.userRepository.findBy({
        fieldName: 'username',
        value: updateUserDto.username,
      });

      if (newUsername) {
        errorPayload.push({
          property: 'username',
          constraints: {
            unique: 'already taken',
          },
        });
      }
    }

    if (Object.keys(errorPayload).length > 0) {
      throw new UnprocessableEntityException(errorPayload);
    }

    if (updateUserDto.avatar && user.avatar) {
      const path = `public/images/profile/${user.avatar}`;

      if (existsSync(path)) {
        unlinkSync(`public/images/profile/${user.avatar}`);
      }
    }

    const userSaved = await this.userRepository.update({
      id: user.id,
      data: updateUserDto,
      cls: UserEntity,
      transformOptions: {
        groups: [GROUP_USER, GROUP_ADMIN],
      },
    });

    return userSaved;
  }

  /**
   * login user
   * @param userLoginDto
   */
  async verifyUser(
    userLoginDto: UserLoginDto,
  ): Promise<[user: UserEntity, error: string, code: number]> {
    const { username, password } = userLoginDto;

    let user = await this.userRepository.findBy({
      fieldName: 'username',
      value: username,
    });

    if (!user) {
      user = await this.userRepository.findBy({
        fieldName: 'email',
        value: username,
      });
    }

    if (user) {
      const hash = await bcrypt.hash(password, user.salt);

      if (user && hash === user.password) {
        if (user.status !== UserStatusEnum.ACTIVE) {
          return [
            null,
            ExceptionTitleList.UserInactive,
            StatusCodesList.UserInactive,
          ];
        }

        return [user, null, null];
      }
    }

    return [
      null,
      ExceptionTitleList.InvalidCredentials,
      StatusCodesList.InvalidCredentials,
    ];
  }

  /**
   * activate newly register account
   * @param token
   */
  async activateAccount(token: string): Promise<void> {
    const user = await this.userRepository.findBy({
      fieldName: 'token',
      value: token,
    });

    if (!user) {
      throw new NotFoundException();
    }

    if (user.status !== UserStatusEnum.INACTIVE) {
      throw new ForbiddenException(
        ExceptionTitleList.UserInactive,
        StatusCodesList.UserInactive,
      );
    }
    user.status = UserStatusEnum.ACTIVE;
    user.token = await this.generateUniqueToken(6);
    user.skipHashPassword = true;
    await this.userRepository.update({
      id: user.id,
      data: user,
    });
  }



  /**
   * get user profile
   * @param user
   */
  async get(user: Partial<UserEntity>): Promise<UserEntity> {
    if (!user.id) {
      throw new NotFoundException();
    }

    const query: QueryPrisma = {
      select: 'all',
      filter: [{ path: 'id', value: user.id }],
      populate: [
        {
          path: 'role',
          select: 'all',
        },
      ],
    };

    return await this.userRepository.findOne({
      searchFilter: query,
    });
  }

  /**
   * get user profile
   * @param id
   */
  async getWithPassword(id: string): Promise<UserEntity> {
    const query: QueryPrisma = {
      select: 'all',
      filter: [{ path: 'id', value: id }],
      populate: [
        {
          path: 'role',
          select: 'all',
          populate: [
            {
              path: 'permissions',
              select: 'all',
            },
          ],
        },
      ],
    };

    return await this.userRepository.findOne({
      searchFilter: query,
    });
  }

  /**
   * Get user By Id
   * @param id
   */
  async findById(id: string): Promise<UserEntity> {
    const query: QueryPrisma = {
      select: 'all',
      filter: [{ path: 'id', value: id }],
      populate: [
        {
          path: 'role',
          select: 'all',
          populate: [
            {
              path: 'permissions',
              select: 'all',
            },
          ],
        },
      ],
    };

    return await this.userRepository.findOne({
      searchFilter: query,
      cls: UserEntity,
      transformOptions: {
        groups: [GROUP_USER, GROUP_ADMIN],
      },
    });
  }

  /**
   * Get user By username
   * @param id
   */
  async findByUsername(username: string): Promise<UserEntity> {
    const query: QueryPrisma = {
      select: 'all',
      filter: [{ path: 'username', value: username }],
    };

    return await this.userRepository.findOne({
      searchFilter: query,
      cls: UserEntity,
      transformOptions: {
        groups: [GROUP_USER, GROUP_ADMIN],
      },
    });
  }

  /**
   * Get all user paginated
   * @param userSearchFilterDto
   */
  async findAll(
    userSearchFilterDto: QueryPrisma,
  ): Promise<Pagination<UserEntity>> {
    // use this to test if needed
    // const query: QueryPrisma = {
    //   select: 'all',
    //   // filter: [{ path: 'name', value: 'lu', operator: 'contains' }],
    //   sort: { field: 'name', criteria: 'asc' },
    //   populate: [
    //     {
    //       path: 'role',
    //       select: 'name',
    //       populate: [
    //         {
    //           path: 'permissions',
    //           select: 'all',
    //         },
    //       ],
    //     },
    //   ],
    //   page: 3,
    //   limit: 3,
    // };
    // const queryString = QueryString(query);
    // console.log(userSearchFilterDto);
    // console.log(queryString);
    // const queryValidator = await Querybuilder.query(query);
    // console.log(JSON.stringify(queryValidator));

    return await this.userRepository.paginate({
      searchFilter: userSearchFilterDto,
      cls: UserEntity,
      transformOptions: {
        groups: [GROUP_USER, GROUP_ADMIN, GROUP_DEFAULT],
      },
    });
  }

  /**
   * generate unique token
   * @param length
   */
  async generateUniqueToken(length: number): Promise<string> {
    const token = this.generateRandomCode(length);

    const tokenCount = await this.userRepository.findBy({
      fieldName: 'token',
      value: token,
    });

    // recursively find unique tokens
    if (tokenCount) {
      await this.generateUniqueToken(length);
    }

    return token;
  }



  /**
   * generate random string code providing length
   * @param length
   * @param uppercase
   * @param lowercase
   * @param numerical
   */
  generateRandomCode(
    length: number,
    uppercase = true,
    lowercase = true,
    numerical = true,
  ): string {
    let result = '';
    const lowerCaseAlphabets = 'abcdefghijklmnopqrstuvwxyz';
    const upperCaseAlphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numericalLetters = '0123456789';
    let characters = '';

    if (uppercase) {
      characters += upperCaseAlphabets;
    }

    if (lowercase) {
      characters += lowerCaseAlphabets;
    }

    if (numerical) {
      characters += numericalLetters;
    }
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  /**
   * Generate access token
   * @param user
   * @param isTwoFAAuthenticated
   */
  public async generateAccessToken(
    user: UserEntity,
    isTwoFAAuthenticated = false,
  ): Promise<string> {
    const opts: SignOptions = {
      ...BASE_OPTIONS,
      subject: String(user.id),
    };

    return this.jwt.signAsync({
      ...opts,
      isTwoFAAuthenticated,
    });
  }

  /**
   * Get cookie for logout action
   */
  getCookieForLogOut(): string[] {
    return [
      `Authentication=; HttpOnly; Path=/; Max-Age=0; ${
        !isSameSite ? 'SameSite=None; Secure;' : ''
      }`,
      `Refresh=; HttpOnly; Path=/; Max-Age=0; ${
        !isSameSite ? 'SameSite=None; Secure;' : ''
      }`,
      `ExpiresIn=; Path=/; Max-Age=0; ${
        !isSameSite ? 'SameSite=None; Secure;' : ''
      }`,
    ];
  }

  /**
   * build response payload
   * @param accessToken
   * @param refreshToken
   */
  buildResponsePayload(accessToken: string, refreshToken?: string): string[] {
    let tokenCookies = [
      `Authentication=${accessToken}; HttpOnly; Path=/; ${
        !isSameSite ? 'SameSite=None; Secure;' : ''
      } Max-Age=${jwtConfig.cookieExpiresIn}`,
    ];

    if (refreshToken) {
      const expiration = new Date();
      expiration.setSeconds(expiration.getSeconds() + jwtConfig.expiresIn);
      tokenCookies = tokenCookies.concat([
        `Refresh=${refreshToken}; HttpOnly; Path=/; ${
          !isSameSite ? 'SameSite=None; Secure;' : ''
        } Max-Age=${jwtConfig.cookieExpiresIn}`,
        `ExpiresIn=${expiration}; Path=/; ${
          !isSameSite ? 'SameSite=None; Secure;' : ''
        } Max-Age=${jwtConfig.cookieExpiresIn}`,
      ]);
    }

    return tokenCookies;
  }



}
