import { Schema, Types, model } from 'mongoose';

interface IPost {
    title: string;
    author: Types.ObjectId;
    content: string;
    comments: Types.ObjectId[];
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema<IPost>(
    {
        title: { type: String, required: true },
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        comments: {
            type: [Schema.Types.ObjectId],
            ref: 'Comment',
            required: true,
            default: [],
        },
        isPublished: { type: Boolean, required: true, default: false },
    },
    { timestamps: true },
);

export default model('Post', postSchema);
