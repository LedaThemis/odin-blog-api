import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import passport from 'passport';

import Post from '../models/post';

export const post_create = [
    passport.authenticate('jwt', { session: false }),
    body('title', 'Title must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('content', 'Content must be 32 characters or more.')
        .trim()
        .isLength({ min: 32 })
        .escape(),
    async (req: Request, res: Response, next: NextFunction) => {
        const post = new Post({
            title: req.body.title,
            author: req.user?.id,
            content: req.body.content,
        });

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        post.save((err, savedPost) => {
            if (err) return next(err);

            return res.status(200).json({
                post: savedPost,
            });
        });
    },
];

export function post_get(req: Request, res: Response) {
    res.json({
        message: 'NOT IMPLEMENTED',
    });
}

export function post_update(req: Request, res: Response) {
    res.json({
        message: 'NOT IMPLEMENTED',
    });
}

export function post_delete(req: Request, res: Response) {
    res.json({
        message: 'NOT IMPLEMENTED',
    });
}

export function post_comments_get(req: Request, res: Response) {
    res.json({
        message: 'NOT IMPLEMENTED',
    });
}

export function post_comment_create(req: Request, res: Response) {
    res.json({
        message: 'NOT IMPLEMENTED',
    });
}
