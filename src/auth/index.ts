import dotenv from 'dotenv';
import { ExtractJwt, Strategy } from 'passport-jwt';

import User from '../models/user';

dotenv.config();

export default new Strategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.SECRET_KEY,
    },
    (jwt_payload: { id: string; iat: number }, done) => {
        User.findById(jwt_payload.id, {}, {}, (err, user) => {
            if (err) return done(err, false);

            if (user) {
                return done(null, { id: user._id });
            } else {
                return done(null, false);
            }
        });
    },
);
