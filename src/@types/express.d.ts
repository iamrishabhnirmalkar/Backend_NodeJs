declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        username: string;
        roles?: string[];
        permissions?: string[];
      };
    }
  }
}

export {};
