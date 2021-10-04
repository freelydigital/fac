import { JwtPayload } from 'jsonwebtoken';
export interface AuthToken extends JwtPayload {
  roles?: Array<string>;
  file?: string;
}
