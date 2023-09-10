export enum Role {
  user = 'USER',
  admin = 'ADMIN',
  fabric = 'FABRIC',
}

export interface TokenInterface {
  userId: string;
  email: string;
  role: string;
  iat: string;
  exp: string;
}

export interface ValidationErrorInterface {
  name: string;
  errors: Array<string>;
}

export interface ValidationPayloadInterface {
  property: string;
  constraints: Record<string, string>;
}
