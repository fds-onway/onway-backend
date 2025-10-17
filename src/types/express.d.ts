import { User } from 'src/drizzle/schema';

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}
