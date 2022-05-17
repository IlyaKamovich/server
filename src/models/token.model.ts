import mongoose, { Schema } from 'mongoose';
import { IToken } from '../interfaces/token.inteface';

const TokenSchema: Schema = new Schema({
  tokenId: { type: String, required: true },
  userId: { type: String, required: true },
});

export default mongoose.model<IToken>('Token', TokenSchema);
