declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string;
            MONGODB_URI: string;
            SECRET_KEY: string;
            JWT_EXPIRES_IN: string;
        }
    }

    namespace Express {
        interface User {
            id: string;
        }
    }
}

export {};
