import { NextFunction, Request, Response } from 'express';
import { logger } from '@utils/logger';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from 'config';

const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let token: string = req.body.token || req.headers['authorization'];
  token = token.replace(/Bearer /gi, '');
  if (!token) {
    const status = 403;
    const message = 'A token is required for authentication';
    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    return res.status(status).json({ message });
  }

  try {
    const decoded = jwt.verify(token, config.get('secretKey'));
    req.jwtTokenPayload = decoded as JwtPayload;
  } catch (err) {
    const status = 401;
    const message = 'Invalid Token';
    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    return res.status(status).json({ message });
  }
  return next();
};
export default AuthMiddleware;
