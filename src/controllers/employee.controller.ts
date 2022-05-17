import { hashSync } from 'bcryptjs';
import { Request, Response } from 'express';
import { ColorList } from '../constants';
import { ICreateEmployee, IEmployee } from '../interfaces/employee.inteface';
import Employee from '../models/employee.model';

class EmployeeController {
  public create = (req: Request, res: Response) => {
    const employee = <ICreateEmployee>req.body;

    employee.password = hashSync(employee.password);
    Employee.findOne({ email: employee.email })
      .then((body) => {
        if (!body) {
          Employee.create<IEmployee>({
            ...req.body,
            colorAvatar: ColorList[Math.floor(Math.random() * Math.floor(4))],
          })
            .then((employee) => res.sendStatus(200).json({ message: 'Данные успешно сохранены', employee }))
            .catch(() => res.status(401).json({ message: 'Не верно введены данные!' }));
        } else {
          res.status(402).json({ message: 'Такой пользователь существует!' });
        }
      })
      .catch((err) => res.status(401).json({ message: 'Не верно введены данные!' }));
  };

  public getAll = async (req: Request, res: Response) => {
    try {
      const employees = await Employee.find({ admin: false, activate: true }).lean();
      res.status(200).json(employees);
    } catch {
      res.status(500).json({ message: 'Ошибка сервера!' });
    }
  };

  public updateById = async (req: Request, res: Response) => {
    try {
      const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, { ...req.body }).exec();
      res.status(200).json({ message: 'Данные успешно изменены', updatedEmployee });
    } catch {
      res.status(500).json({ message: 'Ошибка сервера!' });
    }
  };

  public removeById = async (req: Request, res: Response) => {
    try {
      await Employee.findByIdAndUpdate(req.params.id, { activate: false }).exec();
      res.status(200).json({ message: 'Данные успешно удалены' });
    } catch {
      res.status(500).json({ message: 'Ошибка сервера!' });
    }
  };

  public getById = async (req: Request, res: Response) => {
    try {
      const employee = await Employee.findById(req.params.id).exec();
      res.status(200).json(employee);
    } catch {
      res.status(500).json({ message: 'Ошибка сервера!' });
    }
  };
}

export default EmployeeController;
