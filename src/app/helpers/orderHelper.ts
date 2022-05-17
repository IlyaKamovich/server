import Service from '../../models/service.model';
import { IService } from '../../interfaces/service.interface';
import Order, { IOrderedServices } from '../models/orderedServices';
import Employee from '../../models/employee.model';
import { IEmployee } from '../../interfaces/employee.inteface';

type EmployeeWorkCount = {
  employee: IEmployee;
  countWork: number;
};

type dataEmployee = {
  employees: EmployeeWorkCount[];
  type: string;
};

type orderEmployee = {
  service: string;
  employee: string;
  startTimeEmployee: Date;
  type: string;
  price: number;
  time: number;
};

type findOrder = {
  order: IOrderedServices[];
  dateStart: Date;
  dateEnd: Date;
};

const sortArrayEmployeeWork = (obj1: EmployeeWorkCount, obj2: EmployeeWorkCount): 1 | -1 | 0 => {
  if (obj1.countWork < obj2.countWork) {
    return 1;
  }
  if (obj1.countWork > obj2.countWork) {
    return -1;
  }
  return 0;
};

const compareTwoEmployee = async (first: orderEmployee, second: orderEmployee): Promise<orderEmployee> => {
  if (first.employee === null) {
    return second;
  }
  if (second.employee === null) {
    return first;
  }
  if (Date.parse(first.startTimeEmployee.toDateString()) >= Date.parse(second.startTimeEmployee.toDateString())) {
    if (first.employee.toString() === second.employee.toString()) {
      return first;
    } else {
      return second;
    }
  } else {
    if (first.employee.toString() === second.employee.toString()) {
      return second;
    } else {
      return first;
    }
  }
};

const getEmployeesSort = async () => {
  const type = ['massage', 'barber', 'manicure'];
  const employeeAll: dataEmployee[] = [];
  await Promise.all(
    type.map(async (p) => {
      const employee: EmployeeWorkCount[] = [];
      const employees = await Employee.find({ specialization: p, activate: true }).exec();
      await Promise.all(
        employees.map(async (employ) => {
          await Order.find({ 'orders.employee': employ._id, 'orders.type': p, status: true })
            .exec()
            .then(async (count) => {
              await employee.push({ countWork: 0, employee: employ });
              await Promise.all(
                count.map(
                  async (orders) =>
                    await orders.orders.map(async (order) => {
                      if (employ._id.toString() === order.employee.toString() && order.type === p) {
                        employee[employee.length - 1].countWork++;
                      }
                    })
                )
              );
            });
        })
      );
      employeeAll.push({ employees: employee, type: p });
    })
  );
  return employeeAll;
};

const freeDayOrder = async (order: IOrderedServices) => {
  const employeeAll: dataEmployee[] = await getEmployeesSort();
  await Promise.all(
    order.orders.map(async (order) => {
      await employeeAll.map(async (employees) => {
        if (employees.type === order.type) {
          order.employee = employees.employees[0].employee._id;
          employees.employees[0].countWork++;
          return;
        }
      });
      employeeAll.map((emp) => {
        emp.employees.sort(sortArrayEmployeeWork);
      });
    })
  );
  return order;
};

export const checkEmployeeFree = async (order: IOrderedServices) => {
  let orderedServices: findOrder = {
    dateStart: new Date(order.startTime.getTime()),
    dateEnd: new Date(order.startTime.getTime()),
    order: [],
  };

  orderedServices.dateStart.setMinutes(0);
  orderedServices.dateStart.setHours(3);
  orderedServices.dateEnd.setMinutes(59);
  orderedServices.dateEnd.setHours(26);

  try {
    await Order.find({ startTime: { $gte: orderedServices.dateStart, $lt: orderedServices.dateEnd } })
      .exec()
      .then(async (res) => {
        orderedServices.order = [...res];
      })
      .catch(() => []);
  } catch (e) {
    console.log('exception');
  }

  if (orderedServices.order.length === 0) {
    return await freeDayOrder(order);
  }
  const employeeAll: dataEmployee[] = await getEmployeesSort();

  for (let i = 0; i < order.orders.length; i++) {
    const orderCheck: orderEmployee = { ...order.orders[i] };
    orderCheck.startTimeEmployee = new Date(order.orders[i].startTimeEmployee);

    await employeeAll.map(async (emp) => {
      await emp.employees.sort(sortArrayEmployeeWork);
    });

    await Promise.all(
      employeeAll.map(async (employeeType) => {
        if (order.orders[i].type === employeeType.type) {
          const orderCheck2: orderEmployee = { ...orderCheck };
          orderCheck2.startTimeEmployee = new Date(orderCheck.startTimeEmployee);

          await Promise.all(
            employeeType.employees.map(async (employeeAndCount) => {
              await Promise.all(
                orderedServices.order.map(async (dataOrders) => {
                  await Promise.all(
                    dataOrders.orders.map(async (dataOrder) => {
                      if (employeeType.type === dataOrder.type) {
                        const orderCheckFake: orderEmployee = { ...orderCheck2 };
                        orderCheckFake.startTimeEmployee = new Date(orderCheck2.startTimeEmployee);
                        if (employeeAndCount.employee._id.toString() === dataOrder.employee.toString()) {
                          const endWork = new Date(dataOrder.startTimeEmployee.getTime());
                          const endWork2 = new Date(orderCheckFake.startTimeEmployee.getTime());
                          endWork.setMinutes(endWork.getMinutes() + dataOrder.time);
                          endWork2.setMinutes(endWork2.getMinutes() + orderCheck2.time);
                          if (Date.parse(endWork.toJSON()) < Date.parse(orderCheck2.startTimeEmployee.toJSON())) {
                            orderCheckFake.employee = employeeAndCount.employee._id;
                            orderCheckFake.startTimeEmployee = new Date(orderCheck2.startTimeEmployee);
                          } else if (Date.parse(dataOrder.startTimeEmployee.toJSON()) > Date.parse(endWork2.toJSON())) {
                            orderCheckFake.employee = employeeAndCount.employee._id;
                            orderCheckFake.startTimeEmployee = new Date(orderCheck2.startTimeEmployee);
                          } else {
                            orderCheckFake.employee = employeeAndCount.employee._id;
                            orderCheckFake.startTimeEmployee = new Date(endWork);
                          }
                        } else {
                          orderCheckFake.employee = employeeAndCount.employee._id;
                          orderCheckFake.startTimeEmployee = new Date(orderCheck2.startTimeEmployee);
                        }
                        const check = { ...(await compareTwoEmployee(orderCheck2, orderCheckFake)) };
                        orderCheck2.employee = check.employee;
                        orderCheck2.startTimeEmployee = await new Date(check.startTimeEmployee);
                      }
                    })
                  );
                })
              );
              const check = { ...(await compareTwoEmployee(orderCheck2, orderCheck)) };
              orderCheck.employee = check.employee;
              orderCheck.startTimeEmployee = new Date(check.startTimeEmployee);
              orderCheck2.startTimeEmployee = new Date(order.orders[i].startTimeEmployee);
            })
          );
        }
      })
    );
    order.orders[i].employee = orderCheck.employee;
    order.orders[i].startTimeEmployee = new Date(orderCheck.startTimeEmployee);
    await Promise.all(
      employeeAll.map(async (employeeType) => {
        if (order.orders[i].type === employeeType.type) {
          await employeeType.employees.map(async (employeeAndCount) => {
            if (order.orders[i].employee.toString() === employeeAndCount.employee._id.toString()) {
              employeeAndCount.countWork++;
            }
          });
        }
      })
    );
    if (i < order.orders.length - 1) {
      order.orders[i + 1].startTimeEmployee = new Date(orderCheck.startTimeEmployee);
      order.orders[i + 1].startTimeEmployee.setMinutes(orderCheck.startTimeEmployee.getMinutes() + orderCheck.time);
    }
  }
  order.startTime = new Date(order.orders[0].startTimeEmployee);
  return order;
};

export const addInDateOrder = async (order: IOrderedServices): Promise<IOrderedServices | null> => {
  return await Order.create(order)
    .then((res) => res)
    .catch(() => null);
};

type orderFull = {
  service: IService;
  employee: IEmployee;
  type: string;
  price: number;
  startTime: string;
  time: number;
};

export const getFullOrderById = async (id: string): Promise<orderFull[]> => {
  const orderFullList: orderFull[] = [];
  const order = await Order.findOne({ _id: id, status: true }).exec();

  if (order) {
    await Promise.all(
      order.orders.map(async (order) => {
        const employee = await Employee.findById(order.employee).exec();
        const service = await Service.findById(order.service).exec();
        if (employee && service) {
          await orderFullList.push({
            employee,
            service,
            price: order.price,
            startTime: order.startTimeEmployee.toString().slice(0, 21),
            time: order.time,
            type: order.type,
          });
        }
      })
    );
  }

  return orderFullList;
};
