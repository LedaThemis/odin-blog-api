import { Router } from 'express';

import * as commentsController from '../controllers/commentsController';

const router = Router();

// Update comment
router.put('/:commentId', commentsController.comment_update);

// Delete comment
router.delete('/:commentId', commentsController.comment_delete);

export default router;
