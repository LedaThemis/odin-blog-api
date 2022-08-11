import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Types } from 'mongoose';
import passport from 'passport';

import Comment from '../models/comment';
import User from '../models/user';

const validCommentId = (req: Request, res: Response, next: NextFunction) => {
    if (!Types.ObjectId.isValid(req.params.commentId)) {
        return res.sendStatus(400);
    }

    next();
};

const validateErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
        });
    }

    next();
};

export const comment_update = [
    validCommentId,
    passport.authenticate('jwt', { session: false }),
    body('content', 'Content must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    validateErrors,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const comment = await Comment.findById(req.params.commentId);

            if (!comment) {
                return res.sendStatus(404);
            }

            const currentUser = await User.findById(req.user?.id);

            if (
                req.user?.id.toString() === comment.author.toString() ||
                (currentUser && currentUser.isAdmin)
            ) {
                if (req.body.content) {
                    comment.content = req.body.content;
                }

                const updatedComment = await comment.save();

                return res.json({
                    comment: updatedComment,
                });
            } else {
                return res.sendStatus(403);
            }
        } catch (err) {
            return next(err);
        }
    },
];

export const comment_delete = [
    validCommentId,
    passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const comment = await Comment.findById(req.params.commentId);

            if (!comment) {
                return res.sendStatus(404);
            }

            const currentUser = await User.findById(req.user?.id);

            if (
                req.user?.id.toString() === comment.author.toString() ||
                (currentUser && currentUser.isAdmin)
            ) {
                await comment.deleteOne();

                return res.sendStatus(200);
            } else {
                return res.sendStatus(403);
            }
        } catch (err) {
            return next(err);
        }
    },
];
