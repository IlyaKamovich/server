import { IService } from './../interfaces/service.interface';
import { Request, Response } from 'express';
import Service from '../models/service.model';
import ServiceHelper from '../helpers/service.helper';

class ServiceController {
  private serviceHelper = new ServiceHelper();

  public getAllServices = async (req: Request, res: Response) => {
    const services = (await Service.find().lean()) as IService[];
    const formattedServices = await this.serviceHelper.formatServices(services);

    res.status(200).json(formattedServices);
  };

  public createService = async (req: Request, res: Response) => {
    try {
      const newService = await Service.create(req.body);
      res.status(200).json({ message: 'Данные успешно добавленные', newService });
    } catch {
      res.status(500).json({ message: 'Ошибка сервера!' });
    }
  };

  public updateService = async (req: Request, res: Response) => {
    try {
      const updatedService = await Service.findByIdAndUpdate(req.params.id, { ...req.body }).exec();
      res.status(200).json({ message: 'Данные успешно изменены', updatedService });
    } catch {
      res.status(500).json({ message: 'Ошибка сервера!' });
    }
  };

  public getAllForAdmin = async (req: Request, res: Response) => {
    try {
      const services = await Service.find().lean();
      res.status(200).json(services);
    } catch {
      res.status(500).json({ message: 'Ошибка сервера!' });
    }
  };

  public removeServiceById = async (req: Request, res: Response) => {
    try {
      await Service.findByIdAndDelete(req.params.id).exec();
      res.status(200).json({ message: 'Данные успешно удалены' });
    } catch {
      res.status(500).json({ message: 'Ошибка сервера!' });
    }
  };

  public getServiceById = async (req: Request, res: Response) => {
    try {
      const service = await Service.findById(req.params.id).exec();
      res.status(200).json(service);
    } catch {
      res.status(500).json({ message: 'Ошибка сервера!' });
    }
  };
}

export default ServiceController;
