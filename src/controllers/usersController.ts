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


export function user_register(req: Request, res: Response) {
    res.json({
        message: 'NOT IMPLEMENTED',
    });
}

export function user_login(req: Request, res: Response) {
    res.json({
        message: 'NOT IMPLEMENTED',
    });
}

export function user_get(req: Request, res: Response) {
    res.json({
        message: 'NOT IMPLEMENTED',
    });
}

export function user_posts_get(req: Request, res: Response) {
    res.json({
        message: 'NOT IMPLEMENTED',
    });
}
