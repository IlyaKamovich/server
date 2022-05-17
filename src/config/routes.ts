import { Router } from 'express';
import order from '../app/controllers/order.controller';
import authMiddleware from '../middleware/auth.middleware';
import AuthController from '../controllers/auth.controller';
import EmployeeController from '../controllers/employee.controller';
import ChartController from '../controllers/chart.controller';
import IndexController from '../controllers/index.controller';
import ServiceController from '../controllers/service.controller';

module.exports = (app: Router) => {
  const indexController = new IndexController();
  const authController = new AuthController();
  const employeeController = new EmployeeController();
  const serviceController = new ServiceController();
  const chartController = new ChartController();

  app.get('/api', indexController.index);

  app.post('/api/sign_up', authController.signUp);
  app.post('/api/sign_in', authController.singIn);
  app.get('/api/auth/me', authMiddleware.authMiddleware, authController.authMe);
  app.get('/api/logout', authMiddleware.authMiddleware, authController.logout);

  app.get('/api/service/for_admin', serviceController.getAllForAdmin);
  app.get('/api/service/:id', authMiddleware.authMiddleware, serviceController.getServiceById);
  app.post('/api/service', authMiddleware.authMiddleware, serviceController.createService);
  app.put('/api/service/:id', authMiddleware.authMiddleware, serviceController.updateService);
  app.delete('/api/service/:id', authMiddleware.authMiddleware, serviceController.removeServiceById);
  app.get('/api/service', serviceController.getAllServices);

  app.post('/api/basket/check_date', order.dateCheck);
  app.post('/api/order', order.create);
  app.get('/api/order', order.getAll);
  app.get('/api/order/:id', order.getId);
  app.put('/api/order/:id', order.update);
  app.delete('/api/order/:id', order.remove);

  app.post('/api/employee', authMiddleware.authMiddleware, employeeController.create);
  app.get('/api/employee', authMiddleware.authMiddleware, employeeController.getAll);
  app.get('/api/employee/:id', authMiddleware.authMiddleware, employeeController.getById);
  app.put('/api/employee/:id', authMiddleware.authMiddleware, employeeController.updateById);
  app.delete('/api/employee/:id', authMiddleware.authMiddleware, employeeController.removeById);
  app.get('/api/employee/work/:id', authMiddleware.authMiddleware, order.getWorkByID);
  app.get('/api/employee/work_in_7_days/:id', authMiddleware.authMiddleware, order.getWorkIn7DaysByID);

  app.get('/api/chart/line', authMiddleware.authMiddleware, chartController.getLineChart);
  app.get('/api/chart/pie', authMiddleware.authMiddleware, chartController.getPieChart);
};
