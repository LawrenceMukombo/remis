import jwt, { SignOptions } from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'default_secret';
const EXPIRY = process.env.JWT_EXPIRY || '24h';

export const signToken = (payload: object) => {
    const options: SignOptions = { expiresIn: EXPIRY as any }; // Cast to any or strict string union if needed
    return jwt.sign(payload, SECRET, options);
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, SECRET);
};
