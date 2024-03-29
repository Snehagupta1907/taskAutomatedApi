import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    apiKey: string;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true },
    apiKey: { type: String, required: true, unique: true }
});

export default mongoose.model<IUser>('User', UserSchema);
