import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { CustomValidator, body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import passport from 'passport';

import Post from '../models/post';
import User from '../models/user';

dotenv.config();

const validUserId = (req: Request, res: Response, next: NextFunction) => {
    if (!Types.ObjectId.isValid(req.params.userId)) {
        return res.sendStatus(400);
    }

    next();
};

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

const validateErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            state: 'failed',
            errors: errors.array(),
        });
    }

    next();
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
    validateErrors,

    (req: Request, res: Response, next: NextFunction) => {
        const { username, password }: AccessBody = req.body;

        const user = new User({ username, password });

        user.save((err) => {
            if (err) return next(err);

            return res.json({
                state: 'success',
            });
        });
    },
];

export const user_login = [
    body('username', 'Username must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('password', 'Password must be 8 characters or more.')
        .trim()
        .isLength({ min: 8 })
        .escape(),
    validateErrors,

    async (req: Request, res: Response, next: NextFunction) => {
        const { username, password }: AccessBody = req.body;

        const userExists = await User.exists({ username });

        if (!userExists) {
            return res.status(401).json({
                state: 'failed',
                errors: [
                    {
                        msg: 'There is no account registered with the provided username.',
                        param: 'username',
                        value: username,
                        location: 'body',
                    },
                ],
            });
        }

        // Check if username, password match
        User.findOne({ username }, {}, {}, async (err, user) => {
            if (err) return next(err);

            if (await user?.comparePassword(password)) {
                const token: string = jwt.sign(
                    { id: user?._id },
                    process.env.SECRET_KEY,
                    {
                        expiresIn: process.env.JWT_EXPIRES_IN,
                    },
                );

                return res.json({
                    state: 'success',
                    token,
                    expiresIn: process.env.JWT_EXPIRES_IN,
                    userId: user?._id,
                });
            } else {
                return res.status(401).json({
                    state: 'failed',
                    errors: [
                        {
                            msg: 'Password is incorrect.',
                            param: 'password',
                            value: password,
                            location: 'body',
                        },
                    ],
                });
            }
        });
    },
];

export const user_get = [
    validUserId,
    (req: Request, res: Response) => {
        User.findById(req.params.userId).then((user) => {
            if (!user) {
                return res.json({
                    errors: [
                        {
                            msg: 'User does not exist.',
                            param: 'userId',
                            value: req.params.userId,
                            location: 'params',
                        },
                    ],
                });
            }

            return res.json({
                user: {
                    _id: user._id,
                    username: user.username,
                    __v: user.__v,
                },
            });
        });
    },
];

export const user_posts_get = [
    validUserId,
    (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate(
            'jwt',
            { session: false },
            async (err, currentUser) => {
                if (err) return next(err);

                try {
                    const postsAuthor = await User.findById(req.params.userId);

                    if (!postsAuthor) {
                        return res.sendStatus(404);
                    }

                    let posts;

                    if (
                        currentUser &&
                        currentUser.id.toString() === postsAuthor._id.toString()
                    ) {
                        posts = await Post.find({
                            author: postsAuthor?._id,
                        }).populate('author', 'username');
                    } else {
                        posts = await Post.find({
                            author: postsAuthor?._id,
                            isPublished: true,
                        }).populate('author', 'username');
                    }

                    return res.json({
                        state: 'success',
                        posts,
                    });
                } catch (err) {
                    return next(err);
                }
            },
        )(req, res, next);
    },
];
