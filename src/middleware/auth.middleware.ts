import { NextFunction, Request, Response } from 'express';
import jwt, { TokenExpiredError, verify } from 'jsonwebtoken';
import { findAdminID } from '../helpers/auth.helper';
const { secret } = require('../config/app').jwt;

export type verifyType = {
  userId: string;
  type: string;
  iat: number;
  exp: number;
};

export type verifyRefreshType = {
  id: string;
  type: string;
  iat: number;
  exp: number;
};

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authCookie: string = <string>req.headers.cookie;
  if (!authCookie) {
    return res.status(401).json({ message: 'Токен не представлен!' });
  }
  const token = authCookie.replace('accessToken=', '').split('; ')[0];
  let jwtPayload;
  try {
    jwtPayload = <verifyType>verify(token, secret);
    res.locals.jwtPayload = jwtPayload;
    if (jwtPayload.type !== 'access') {
      res.status(401).json({ message: 'Токен не действителен!' });
      return;
    }
  } catch (e) {
    if (e instanceof TokenExpiredError) {
      res.status(401).json({ message: 'Токен истек!' });
      return;
    } else if (e instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Токен не действителен!' });
      return;
    }
  }
  next();
};

const authAdminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = <string>req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Токен не представлен!' });
  }
  const token = authHeader.replace('Bearer ', '');
  let jwtPayload;
  try {
    jwtPayload = <any>verify(token, secret);
    res.locals.jwtPayload = jwtPayload;
    if (jwtPayload.type !== 'access') {
      res.status(401).json({ message: 'Токен не действителен!' });
      return;
    }
  } catch (e) {
    if (e instanceof TokenExpiredError) {
      res.status(401).json({ message: 'Токен истек!' });
      return;
    } else if (e instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Токен не действителен!' });
      return;
    }
  }
  if (!(await findAdminID(jwtPayload.userId))) {
    return res.status(401).json({ message: 'Токен не действителен!' });
  }

  next();
};

export default {
  authMiddleware,
  authAdminMiddleware,
};
