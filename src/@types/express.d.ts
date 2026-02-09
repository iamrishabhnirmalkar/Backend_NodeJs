import { JWTPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload & {
        roles?: string[];
        permissions?: string[];
      };
    }
  }
}

export {};
