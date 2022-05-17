import Service from '../../models/service.model';
import { IService } from '../../interfaces/service.interface';
import Order from '../models/orderedServices';

type employeeWork = {
  order: IService;
  startTime: Date;
  price: number;
};

export const getAllWorkByID = async (idEmployee: string) => {
  const employeeWorks: employeeWork[] = [];
  await Order.find({ 'orders.employee': idEmployee, status: true })
    .exec()
    .then(async (ordersAll) => {
      ordersAll.forEach((orders) => {
        orders.orders.forEach((order) => {
          if (idEmployee.toString() === order.employee.toString()) {
            employeeWorks.push({
              order: order.service,
              startTime: new Date(order.startTimeEmployee),
              price: order.price,
            });
          }
        });
      });
    });
  return Promise.all(
    await employeeWorks.map(
      async (work) =>
        await Service.findOne({ _id: work.order })
          .exec()
          .then((service) => {
            if (!service) {
              throw 404;
            }
            return { service, startTime: work.startTime, realPrice: work.price };
          })
    )
  );
};

export const getWorkNowByID = async (idEmployee: string) => {
  const dateNow = new Date(Date.now());
  dateNow.setHours(4);
  const dateEnd = new Date(dateNow);
  dateEnd.setHours(24 * 7);
  const employeeWorks: employeeWork[] = [];
  try {
    await Order.find({ startTime: { $gte: dateNow, $lt: dateEnd }, 'orders.employee': idEmployee, status: true })
      .exec()
      .then(async (ordersAll) => {
        ordersAll.forEach((orders) => {
          orders.orders.forEach((order) => {
            if (idEmployee.toString() === order.employee.toString()) {
              employeeWorks.push({
                order: order.service,
                startTime: new Date(order.startTimeEmployee),
                price: order.price,
              });
            }
          });
        });
      });
  } catch (e) {
    console.log('exception');
  }

  return Promise.all(
    await employeeWorks.map(
      async (work) =>
        await Service.findOne({ _id: work.order })
          .exec()
          .then((service) => {
            if (!service) {
              throw 404;
            }
            console.log('ilyas');
            return { service, startTime: work.startTime, realPrice: work.price };
          })
    )
  );
};
