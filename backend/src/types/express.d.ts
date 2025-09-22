import { User } from '../entities/User';
import { Vehicle } from '../entities/Vehicle';
import { Booking } from '../entities/Booking';
import { JWTToken } from '../middleware/auth.middleware';

declare global {
  namespace Express {
    interface Request {
      token: JWTToken | null;
      user: User | null;
      vehicle: Vehicle | null;
      booking: Booking | null;
    }
  }
}
