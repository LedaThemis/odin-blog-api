import bcrypt from 'bcryptjs';
import { Model, Schema, model } from 'mongoose';

interface IUser {
    username: string;
    password: string;
    isAdmin?: boolean;
}

interface IUserMethods {
    comparePassword(inputPassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, never, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
    username: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: false },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    bcrypt.hash(this.password, 10, (err, hashedPassword) => {
        if (err) return next(err);

        this.password = hashedPassword;

        return next();
    });
});

userSchema.methods.comparePassword = async function (
    inputPassword: string,
): Promise<boolean> {
    return await bcrypt
        .compare(inputPassword, this.password)
        .catch(() => false);
};

export default model<IUser, UserModel>('User', userSchema);
