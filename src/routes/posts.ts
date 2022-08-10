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

export default router;
