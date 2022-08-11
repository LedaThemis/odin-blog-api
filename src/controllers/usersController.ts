import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { CustomValidator, body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import passport from 'passport';

import User from '../models/user';

dotenv.config();

interface AccessBody {
    username: string;
    password: string;
}

const isValidUser: CustomValidator = async (username: string) => {
    return User.findOne({ username }).then((user) => {
        if (user) {
            return Promise.reject('Username already in use');
        }
    });
};

export const user_register = [
    body('username', 'Username must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .custom(isValidUser)
        .escape(),
    body('password', 'Password must be 8 characters or more.')
        .trim()
        .isLength({ min: 8 })
        .escape(),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        const { username, password }: AccessBody = req.body;

        const user = new User({ username, password });

        user.save((err) => {
            if (err) return next(err);

            return res.sendStatus(200);
        });
    },
];

export async function user_login(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { username, password }: AccessBody = req.body;

    const userExists = await User.exists({ username });

    if (!userExists) {
        return res.status(401).json({
            message:
                'There is no account registered with the provided username',
        });
    }

    // Check if username, password match
    User.findOne({ username }, {}, {}, async (err, user) => {
        if (err) return next(err);

        if (await user?.comparePassword(password)) {
            const token = jwt.sign({ id: user?._id }, process.env.SECRET_KEY, {
                expiresIn: process.env.JWT_EXPIRES_IN,
            });

            return res.json({
                token,
            });
        } else {
            return res.status(401).json({
                message: 'Password is incorrect',
            });
        }
    });
}

export function user_get(req: Request, res: Response) {
    res.json({
        message: 'NOT IMPLEMENTED',
    });
}

export const user_posts_get = [
    passport.authenticate('jwt', { session: false }),
    (req: Request, res: Response) => {
        res.json({
            message: 'NOT IMPLEMENTED',
            user: req.user,
        });
    },
];
