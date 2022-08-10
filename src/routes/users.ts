import { Router } from 'express';

import * as usersController from '../controllers/usersController';

const router = Router();

// Register user
router.post('/register', usersController.user_register);

// Login user
router.post('/login', usersController.user_login);

// GET user
router.get('/:userId', usersController.user_get);

export default router;
