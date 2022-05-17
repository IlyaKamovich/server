import mongoose, { Schema } from 'mongoose';
import { IService } from '../interfaces/service.interface';

export const ServiceSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  time: { type: Number, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
});

export default mongoose.model<IService>('Service', ServiceSchema);
