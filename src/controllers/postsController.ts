import { NextFunction, Request, Response } from 'express';
import { CustomSanitizer, body, validationResult } from 'express-validator';
import { Types } from 'mongoose';
import passport from 'passport';
import sanitize from 'sanitize-html';

import Comment from '../models/comment';
import Post from '../models/post';

const validPostId = (req: Request, res: Response, next: NextFunction) => {
    if (!Types.ObjectId.isValid(req.params.postId)) {
        return res.sendStatus(400);
    }

    next();
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

const sanitizeHtml: CustomSanitizer = (input: string) => {
    return sanitize(input, {
        disallowedTagsMode: 'escape',
    });
};

export const post_create = [
    passport.authenticate('jwt', { session: false }),
    body('title', 'Title must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('content', 'Content must be 32 characters or more.')
        .trim()
        .isLength({ min: 32 })
        .customSanitizer(sanitizeHtml),
    validateErrors,
    async (req: Request, res: Response, next: NextFunction) => {
        const post = new Post({
            title: req.body.title,
            author: req.user?.id,
            content: req.body.content,
        });

        post.save((err, savedPost) => {
            if (err) return next(err);

            return res.status(200).json({
                state: 'success',
                post: savedPost,
            });
        });
    },
];

export const post_get = [
    validPostId,
    async (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate(
            'jwt',
            { session: false },
            async (err, currentUser) => {
                if (err) return next(err);

                const post = await Post.findById(req.params.postId).populate(
                    'author',
                    'username',
                );

                if (!post) {
                    return res.json({
                        state: 'failed',
                        errors: [
                            {
                                msg: 'Post not found.',
                            },
                        ],
                    });
                }

                if (
                    post?.isPublished ||
                    (currentUser &&
                        post?.author._id.toString() ===
                            currentUser.id.toString())
                ) {
                    return res.json({
                        state: 'success',
                        post,
                    });
                } else {
                    return res.json({
                        state: 'failed',
                        errors: [
                            {
                                msg: 'Post not found.',
                            },
                        ],
                    });
                }
            },
        )(req, res, next);
    },
];

export const post_update = [
    validPostId,
    passport.authenticate('jwt', { session: false }),
    body('title', 'Title must not be empty.')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('content', 'Content must be 32 characters or more.')
        .optional()
        .trim()
        .isLength({ min: 32 })
        .customSanitizer(sanitizeHtml),
    body('isPublished', 'isPublished must be either true or false')
        .optional()
        .custom((value) => value === 'true' || value === 'false')
        .toBoolean()
        .isBoolean()
        .escape(),
    validateErrors,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const post = await Post.findById(req.params.postId);

            if (!post) {
                return res.sendStatus(404);
            }

            // Update post
            if (req.body.title) {
                post.title = req.body.title;
            }

            if (req.body.content) {
                post.content = req.body.content;
            }

            if (req.body.isPublished) {
                post.isPublished = req.body.isPublished;
            }

            // Update post
            if (req.user?.id.toString() === post.author.toString()) {
                const updatedPost = await (
                    await post.save()
                ).populate('author');

                return res.json({
                    state: 'success',
                    post: updatedPost,
                });
            } else if (post.isPublished) {
                return res.sendStatus(403);
            } else {
                return res.sendStatus(404);
            }
        } catch (err) {
            return next(err);
        }
    },
];

export const post_delete = [
    validPostId,
    passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const post = await Post.findById(req.params.postId);

            if (!post) {
                return res.sendStatus(404);
            }

            if (req.user?.id.toString() === post.author.toString()) {
                // delete post comments
                await Promise.all(
                    post.comments.map((commentId) =>
                        Comment.findByIdAndDelete(commentId),
                    ),
                );

                // delete post
                await post.deleteOne();

                return res.sendStatus(200);
            } else if (post.isPublished) {
                return res.sendStatus(403);
            } else {
                return res.sendStatus(404);
            }
        } catch (err) {
            return next(err);
        }
    },
];

export const post_comments_get = [
    validPostId,
    (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate(
            'jwt',
            { session: false },
            async (err, currentUser) => {
                if (err) return next(err);

                try {
                    const post = await Post.findById(req.params.postId);

                    if (!post) {
                        return res.sendStatus(404);
                    }

                    if (
                        post.isPublished ||
                        (currentUser &&
                            currentUser.id.toString() ===
                                post.author.toString())
                    ) {
                        const comments = await Promise.all(
                            post.comments.map((commentId) =>
                                Comment.findById(commentId).populate('author', 'username'),
                            ),
                        );

                        return res.json({
                            state: 'success',
                            comments,
                        });
                    } else {
                        return res.json({
                            state: 'failed',
                            errors: [
                                {
                                    msg: 'Post not found.',
                                },
                            ],
                        });
                    }
                } catch (err) {
                    return next(err);
                }
            },
        )(req, res, next);
    },
];

export const post_comment_create = [
    validPostId,
    passport.authenticate('jwt', { session: false }),
    body('content', 'Content must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    validateErrors,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const post = await Post.findById(req.params.postId);

            if (!post) {
                return res.sendStatus(404);
            }

            if (
                post?.isPublished ||
                post?.author.toString() === req.user?.id.toString()
            ) {
                const comment = new Comment({
                    author: req.user?.id,
                    content: req.body.content,
                });

                const savedComment = await comment.save();

                post.comments.push(savedComment._id);

                await post.save();

                return res.json({
                    state: 'success',
                    comment: savedComment,
                });
            } else {
                return res.sendStatus(404);
            }
        } catch (err) {
            return next(err);
        }
    },
];
