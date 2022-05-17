import { Request, Response } from 'express';
import { addInDateOrder, checkEmployeeFree, getFullOrderById } from '../helpers/orderHelper';
import { getAllWorkByID, getWorkNowByID } from '../helpers/employeeHelper';
import { IService } from '../../interfaces/service.interface';
import Order, { IOrderedServices } from '../models/orderedServices';

const dateCheck = async (req: Request, res: Response) => {
  const { date, basket } = req.body;
  const sum = (basket: IService[], type: string) => {
    let sum: number = 0;
    switch (type) {
      case 'time':
        basket.map((p) => (sum += p.time));
        break;
      case 'price':
        basket.map((p) => (sum += p.price));
        break;
      default:
        break;
    }

    return sum;
  };
  const allTime = sum(basket, 'time');
  const checkDateParse = new Date(date + ':00 GMT+0000');
  const dateParser = new Date(date + ':00 GMT+0000');
  checkDateParse.setMinutes(checkDateParse.getMinutes() + allTime);
  if (checkDateParse.getDay() != dateParser.getDay()) {
    dateParser.setHours(dateParser.getHours() + 24);
    dateParser.setHours(12);
    dateParser.setMinutes(0);
  }
  const dateParse = new Date(dateParser);
  const order = <IOrderedServices>(<unknown>{
    allTime: sum(basket, 'time'),
    waitingTime: 0,
    startTime: new Date(dateParse.getTime()),
    orders: [],
    allPrice: sum(basket, 'price'),
    status: false,
  });

  basket.map((p: { price: number; type: string; time: number; _id: string }) => {
    order.orders.push({
      service: p._id,
      employee: null,
      startTimeEmployee: new Date(dateParse.getTime()),
      type: p.type,
      time: p.time,
      price: p.price,
    });
    dateParse.setMinutes(dateParse.getMinutes() + p.time);
  });

  await checkEmployeeFree(order);

  await addInDateOrder(order)
    .then((result) => {
      result ? res.status(200).json(result) : res.status(500).json({ message: 'Ошибка сервера!' });
    })
    .catch((err) => res.status(500).json({ message: 'Ошибка сервера!' }));
};

const create = (req: Request, res: Response) => {
  Order.create(req.body)
    .then((created) => res.status(200).json({ message: 'Данные успешно добавленные' }))
    .catch((err) => res.status(500).json({ message: 'Ошибка сервера!' }));
};

const getAll = (req: Request, res: Response) => {
  Order.find({ status: true })
    .exec()
    .then((data) => res.status(200).json(data))
    .catch((err) => res.status(500).json({ message: 'Ошибка сервера!' }));
};

const getId = (req: Request, res: Response) => {
  getFullOrderById(req.params.id)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => res.status(500).json({ message: 'Ошибка сервера!' }));
};

const update = (req: Request, res: Response) => {
  Order.findByIdAndUpdate(req.params.id, { ...req.body })
    .exec()
    .then((result) => res.status(200).json({ message: 'Данные успешно изменены' }))
    .catch((err) => res.status(500).json({ message: 'Ошибка сервера!' }));
};

const remove = (req: Request, res: Response) => {
  Order.findByIdAndDelete(req.params.id)
    .exec()
    .then((result) => res.status(200).json({ message: 'Данные успешно удалены' }))
    .catch((err) => res.status(500).json({ message: 'Ошибка сервера!' }));
};

const getWorkByID = (req: Request, res: Response) => {
  getAllWorkByID(req.params.id)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => res.status(500).json({ message: 'Ошибка сервера!' }));
};

const getWorkIn7DaysByID = (req: Request, res: Response) => {
  getWorkNowByID(req.params.id)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => res.status(500).json({ message: 'Ошибка сервера!' }));
};

export default {
  dateCheck,
  create,
  getAll,
  update,
  remove,
  getId,
  getWorkByID,
  getWorkIn7DaysByID,
};
