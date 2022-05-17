import mongoose, { Schema } from 'mongoose';

export interface IToken {
  tokenId: string;
  userId: string;
}
