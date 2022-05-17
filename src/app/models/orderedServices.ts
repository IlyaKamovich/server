import mongoose, { Schema, Document } from 'mongoose';
import { IEmployee } from '../../interfaces/employee.inteface';
import { IService } from '../../interfaces/service.interface';

export interface IOrderedServices extends Document {
  allTime: number;
  waitingTime: number;
  startTime: Date;
  allPrice: number;
  orders: [
    {
      service: IService['_id'];
      employee: IEmployee['_id'];
      startTimeEmployee: Date;
      type: string;
      price: number;
      time: number;
    }
  ];
  status: boolean;
}

export const OrderedServicesSchema: Schema = new Schema({
  allTime: { type: Number, required: true },
  waitingTime: { type: Number, required: true },
  startTime: { type: Date, required: true },
  allPrice: { type: Number, required: true },
  orders: {
    type: [
      {
        service: Schema.Types.ObjectId,
        employee: Schema.Types.ObjectId,
        startTimeEmployee: { type: Date, required: true },
        type: { type: String, required: true },
        price: { type: Number, required: true },
        time: { type: Number, required: true },
      },
    ],
    required: true,
  },
  status: { type: Boolean, default: false },
});

export default mongoose.model<IOrderedServices>('OrderedServices', OrderedServicesSchema);
