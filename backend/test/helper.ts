import { DI } from '../src/index';
import { Auth } from '../src/middleware/auth.middleware';
import {User} from "../src/entities/User";
import {Vehicle} from "../src/entities/Vehicle";
import {Booking} from "../src/entities/Booking";

export const loginUser = async () => {
  const em = DI.orm.em.fork();
  const user = await em.getRepository(User).findOne({
    email: 'meisazc31@gmail.com',
  });
  return {
    token: Auth.generateToken({
      email: user!.email,
      username: user!.username,
      id: user!.id,
    }),
    user: user!,
  };
};

export const newBooking = async () => {
  const em = DI.orm.em.fork();
  const booking = await em.getRepository(Booking).findOne({
  totalPrice: 100,
  });
  if (booking) {
    return { booking: booking.id };
  } else {
    // Handle the case where no booking is found
    return { booking: null }; // Or throw an error, based on your requirement
  }
};

export const newVehicle = async () => {
  const em = DI.orm.em.fork();
  const vehicle = await em.getRepository(Vehicle).findOne({
    brand: "ec",
  });
  if (vehicle) {
    return { vehicle: vehicle.id };
  } else {
    // Handle the case where no booking is found
    return { vehicle: null }; // Or throw an error, based on your requirement
  }
};

export const updateUser = async () => {
  const em = DI.orm.em.fork();
  const user = await em.getRepository(User).findOne({
    email: 'example@gmail.com',
  });
  if (user) {
    return { user: user.id,
             password: user.password
    };
  } else {
    // Handle the case where no booking is found
    return { user: null }; // Or throw an error, based on your requirement
  }
};

export const paypalToken = async () => {
  const em = DI.orm.em.fork();
  const booking = await em.getRepository(Booking).findOne({
    totalPrice: 100,
  });
  return {
    token: Auth.generateToken({
      email: "",
      username: "user!.username",
      id: booking!.id,
    }),
  };
};