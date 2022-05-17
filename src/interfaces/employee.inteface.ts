import { Document } from 'mongoose';

export interface IEmployee extends Document {
  readonly admin: boolean;
  name: string;
  surname: string;
  email: string;
  password: string;
  specialization: Array<string>;
  salary: number;
  colorAvatar: string;
  activate: boolean;
}

export interface ICreateEmployee {
  name: string;
  email: string;
  password: string;
}
