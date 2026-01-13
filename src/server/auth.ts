import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
// UserModel will be loaded dynamically inside strategist callback
// import UserModel from '../server/models/User';
import { Request, Response, NextFunction } from 'express';
// @ts-ignore
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

const JWT_SECRET = process.env['JWT_SECRET'] || 'dev_jwt_secret';

passport.use(
  new (GoogleStrategy as any)(
    {
      clientID: process.env['GOOGLE_CLIENT_ID'] || 'GOOGLE_CLIENT_ID',
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'] || 'GOOGLE_CLIENT_SECRET',
      callbackURL: process.env['GOOGLE_CALLBACK_URL'] || '/auth/google/callback',
    },
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        const { default: UserModel } = await import('../server/models/User');
        const email = profile.emails?.[0]?.value as string;
        let user = await UserModel.findOne({ googleId: profile.id });
        if (!user && email) {
          user = await UserModel.findOne({ email });
        }
        if (!user) {
          user = await UserModel.create({ googleId: profile.id, email, name: profile.displayName, role: 'admin' });
        } else if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        done(null, user);
      } catch (err) {
        done(err as any);
      }
    },
  )
);

export function issueJWT(user: any) {
  const payload = { sub: user._id, role: user.role };
  return (jwt as any).sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization as string | undefined;
  let token: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.slice(7);
  if (!token && (req.query as any).token) token = (req.query as any).token as string;
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  try {
    const payload = (jwt as any).verify(token, JWT_SECRET) as any;
    (req as any).user = payload;
    return next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
}

export default passport;
