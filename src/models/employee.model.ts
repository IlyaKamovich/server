import mongoose, { Schema } from 'mongoose';
import { IEmployee } from '../interfaces/employee.inteface';

export const EmployeeSchema: Schema = new Schema({
  admin: { type: Boolean, default: false },
  name: { type: String, required: true },
  surname: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialization: { type: [String], required: false },
  salary: { type: Number, required: false },
  colorAvatar: { type: String, required: true },
  activate: { type: Boolean, required: false, default: true },
});

export default mongoose.model<IEmployee>('Employees', EmployeeSchema);
