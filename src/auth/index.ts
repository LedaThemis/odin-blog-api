import dotenv from 'dotenv';
import { ExtractJwt, Strategy } from 'passport-jwt';

import User from '../models/user';

dotenv.config();

export default new Strategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.SECRET_KEY,
    },
    (jwt_payload: { username: string; iat: number }, done) => {

        User.findOne(
            { username: jwt_payload.username },
            {},
            {},
            (err, user) => {
                if (err) return done(err, false);

                if (user) {
                    return done(null, { username: user.username });
                } else {
                    return done(null, false);
                }
            },
        );
    },
);
