import { AuthToken } from '@/interfaces/authToken.interface';
export {};

declare global {
  namespace Express {
    interface Request {
      jwtTokenPayload: AuthToken;
    }
  }
}
