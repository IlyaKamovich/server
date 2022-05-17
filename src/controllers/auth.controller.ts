import { Request, Response } from 'express';
import { compareSync, hashSync } from 'bcryptjs';
import { verify } from 'jsonwebtoken';
import Employee from '../models/employee.model';
import { updateTokens, removeToken } from '../helpers/auth.helper';
import { verifyRefreshType, verifyType } from '../middleware/auth.middleware';
import { ColorList } from '../constants';
import { IEmployee } from '../interfaces/employee.inteface';

const { secret } = require('../config/app').jwt;

class AuthController {
  public signUp = async (req: Request, res: Response) => {
    try {
      const employee: IEmployee = req.body;

      const currentEmployee = await Employee.findOne({ email: employee.email, activate: true });

      if (currentEmployee) {
        res.status(402).json({ message: 'Такой пользователь существует!' });
      }

      const newCurrentEmployee = await Employee.create<IEmployee>({
        ...req.body,
        password: hashSync(employee.password),
        colorAvatar: ColorList[Math.floor(Math.random() * Math.floor(4))],
      });

      res.status(200).json({ message: 'Данные успешно сохранены', employee: newCurrentEmployee });
    } catch (error) {
      console.log(error);
      res.status(401).json({ message: 'Не верно введены данные!' });
    }
  };

  public singIn = (req: Request, res: Response) => {
    const { email, password } = req.body;

    Employee.findOne({ email })
      .then((result) => {
        if (result) {
          if (compareSync(password, result.password)) {
            const token = updateTokens(result._id);
            res.cookie('accessToken', token.accessToken, { maxAge: 30 * 60 * 60 * 30 });
            res.cookie('refreshToken', token.refreshToken);
            res.json({ message: 'Авторизация прошла успешно' }).status(200);
          } else {
            throw 401;
          }
        } else {
          throw 401;
        }
      })
      .catch(() => {
        res.status(404).json({ message: 'Не верно введены данные!' });
      });
  };

  public authMe = async (req: Request, res: Response) => {
    const authCookie: string = <string>req.headers.cookie;
    if (!authCookie) {
      return res.status(401).json({ message: 'Токен не представлен!' });
    }
    const token = authCookie.replace('accessToken=', '').split('; ')[0];
    const jwtPayload = <verifyType>verify(token, secret);
    Employee.findById(jwtPayload.userId)
      .then((result) => {
        if (result && result.activate) {
          res.json(result).status(200);
        } else {
          throw 404;
        }
      })
      .catch((e) => {
        res.status(404).json({ message: 'Пользователь с таким токеном не был найден!' });
      });
  };

  public logout = async (req: Request, res: Response) => {
    const authCookie: string = <string>req.headers.cookie;
    if (!authCookie) {
      return res.status(401).json({ message: 'Токен не представлен!' });
    }
    const token = authCookie.replace('refreshToken=', '').split('; ')[1];
    const jwtPayload = <verifyRefreshType>verify(token, secret);
    if (await removeToken(jwtPayload.id)) {
      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');
      res.status(200).json({ message: 'Данные успешно удалены!' });
    } else {
      res.status(400).json({ message: 'Не верно введены данные!' });
    }
  };
}

export default AuthController;
