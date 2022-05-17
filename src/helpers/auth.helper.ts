import { v4 as uuid } from 'uuid';
import jwt from 'jsonwebtoken';
const { secret, tokens } = require('../config/app').jwt;
import Token from '../models/token.model';
import Employee from '../models/employee.model';

export const generateAccessToken = (userId: string): string => {
  const payload = {
    userId,
    type: tokens.access.type,
  };

  const options = { expiresIn: tokens.access.expiresIn };
  return jwt.sign(payload, secret, options);
};

export const generateRefreshToken = () => {
  const payload = {
    id: uuid(),
    type: tokens.refresh.type,
  };
  const options = { expiresIn: tokens.refresh.expiresIn };
  return {
    id: payload.id,
    token: jwt.sign(payload, secret, options),
  };
};

export const replaceDbRefreshToken = (tokenId: string, userId: string) => {
  Token.findOneAndDelete({ userId })
    .exec()
    .then(() => {
      Token.create({ tokenId, userId });
    })
    .catch(() => {
      Token.create({ tokenId, userId });
    });
};

export const removeToken = async (tokenId: string): Promise<boolean> => {
  return await Token.findOneAndDelete({ tokenId })
    .exec()
    .then(() => true)
    .catch(() => false);
};

export const updateTokens = (userId: string) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken();

  replaceDbRefreshToken(refreshToken.id, userId);

  return {
    accessToken,
    refreshToken: refreshToken.token,
  };
};

export const findToken = async (payload: { userId: string; tokenId: string }) => {
  return Token.findOne(payload)
    .then(() => true)
    .catch(() => false);
};

export const findAdminID = async (userId: string) => {
  return await Employee.findById({ userId })
    .exec()
    .then((result) => {
      return result ? result.admin : false;
    })
    .catch(() => false);
};

export const findUser = async (userId: string) => {
  return await Employee.findById({ userId }).catch((e) => {});
};
