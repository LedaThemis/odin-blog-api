import { Schema, Types, model } from 'mongoose';

interface IComment {
    author: Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
    {
        author: { type: Schema.Types.ObjectId, required: true },
        content: { type: String, required: true },
    },
    {
        timestamps: true,
    },
);

export default model('Comment', commentSchema);
