import { CanActivate, ExecutionContext, Inject, Logger } from '@nestjs/common';
import { ClientKafka, ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { TokenInterface } from '@core/types';

export class AuthGuard implements CanActivate {
  constructor(
    @Inject('USER_SERVICE')
    private readonly authClient: ClientKafka,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = this.validateRequest(request);
    request.user = user;

    if (!user) {
      return false;
    }

    return true;
  }

  async validateRequest(request) {
    const data = await this.decryptToken(request);

    if (data.userId === '' || data.userId == null) {
      return false;
    }

    return data;
  }

  decryptToken(request): Promise<TokenInterface> {
    return new Promise((resolve, reject) => {
      try {
        this.authClient
          .send('validate_token', {
            jwt: request.headers['authorization']?.split(' ')[1],
          })
          .subscribe({
            next: (data) => resolve(data),
            error: (err) => reject(err),
          });
      } catch (err) {
        const data: TokenInterface = {
          userId: '',
          email: '',
          role: '',
          iat: '',
          exp: '',
        };

        return data;
      }
    });
  }
}
