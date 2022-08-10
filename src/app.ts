import compression from 'compression';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import logger from 'morgan';
import passport from 'passport';

import jwtStrategy from './auth';
import commentsRouter from './routes/comments';
import indexRouter from './routes/index';
import postsRouter from './routes/posts';
import usersRouter from './routes/users';

dotenv.config();

// Database
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Express
const app = express();

// Passport
passport.use(jwtStrategy);

// Middleware
app.use(helmet());
app.use(compression());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.use('/comments', commentsRouter);

export default app;
