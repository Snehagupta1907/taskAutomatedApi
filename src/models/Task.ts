import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
    endpoint: string;
    data: object;
    delay: number;
    method: string;
    status: string;
    userId: mongoose.Types.ObjectId; 
}

const TaskSchema: Schema = new Schema({
    endpoint: { type: String, required: true },
    data: { type: Object },
    delay: { type: Number, default: 0 },
    method: { type: String, required: true },
    status: { type: String, default: 'queued' },
    userId: { type: mongoose.Types.ObjectId, ref: 'User' } 
});

export default mongoose.model<ITask>('Task', TaskSchema);
