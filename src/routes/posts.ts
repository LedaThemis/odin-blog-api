import { Router } from 'express';

import * as postsController from '../controllers/postsController';

const router = Router();

// Create post
router.post('/:postId', postsController.post_create);

// Get post
router.get('/:postId', postsController.post_get);

// Update post
router.put('/:postId', postsController.post_update);

// Delete post
router.delete('/:postId', postsController.post_delete);

// Get post comments
router.get('/:postId/comments', postsController.post_comments_get);

// Create post comment
router.post('/:postId/comments', postsController.create_comment_post);

export default router;
