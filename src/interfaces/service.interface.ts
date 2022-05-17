import { Document } from 'mongoose';

export interface IService extends Document {
  name: string;
  price: number;
  time: number;
  description: string;
  type: string;
}

export interface IFormattedServices {
  serviceType: string;
  serviceName: string;
  serviceList: IService[];
}
