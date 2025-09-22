// @ts-ignore
import request from 'supertest';
import * as express from 'express';



const { CreateBookingSchema } = require('../src/entities/Booking');

const router = express.Router();
import { Auth } from '../src/middleware/auth.middleware';
import * as multer from 'multer';
import {DI, startServer} from "../src/index";
import {CreateVehicleDTO, CreateVehicleSchema} from "../src/entities/Vehicle";
import {Booking, CreateBookingDTO} from "../src/entities/Booking";
import {Vehicle} from "../src/entities/Vehicle";
import {User} from "../src/entities/User";
import {EntityManager, EntityRepository, MikroORM, wrap} from "@mikro-orm/core";
import {paypalToken} from "./helper";

export enum VehicleType {
  Car = 'car',
  Bike = 'bike',
  EScooter = 'escooter',
}

export enum BookingStatus {
  Booked = 'booked',
  Running = 'running',
  Done = 'done',
}


describe('POST /:userID/:vehicleID', () => {
  let vehicletype: VehicleType;
  let bookingStatus: BookingStatus;
  let userRepository: EntityRepository<User>;
  let vehicleRepository: EntityRepository<Vehicle>;
  let bookingRepository: EntityRepository<Booking>;
  let booking: Booking;
  let vehicle: Vehicle;
  let owner: User;
  let emFork: EntityManager;
  let em: EntityManager;

  beforeAll(async () => {
    await startServer();
    //const seeder = DI.orm.getSeeder();
    DI.orm.config.set('dbName', 'FWESS24RIDESHARE');
    DI.orm.config.getLogger().setDebugMode(false);
    DI.orm.config.set('allowGlobalContext', true);
    await DI.orm.config.getDriver().reconnect();
    await DI.orm.getSchemaGenerator().refreshDatabase();

    const hashedPassword = await Auth.hashPassword('123456');
    vehicletype = VehicleType.Car;


    emFork = DI.orm.em.fork(); // Forks the EntityManager

    vehicletype = VehicleType.Car;
    userRepository = emFork.getRepository(User);
    vehicleRepository = emFork.getRepository(Vehicle);
    owner = userRepository.create({
      email: 'meisazc31@gmail.com',
      username: 'username',
      password: 'nhj'
    });
    await emFork.persistAndFlush(owner);

    vehicle = vehicleRepository.create({
      brand: 'ec',
      model: 'erf',
      owner: owner,
      bookings: [],
      city: 'yde',
      type: vehicletype,
      pricePerHour: 10,
      available: true,
      rating: 4
    });
    await emFork.persistAndFlush(vehicle);

    bookingRepository = emFork.getRepository(Booking);
    booking = bookingRepository.create({
      vehicle: vehicle,
      renter: owner,
      startTime: new Date('2026-01-01T00:00:00.000Z'),
      endTime: new Date('2026-01-01T01:00:00.000Z'),
      totalPrice: 100,
      isPaid: false,
      status: BookingStatus.Booked
    });

    await emFork.persistAndFlush(booking);
    //await seeder.seed(TestSeeder);
  });

  afterAll(async () => {
    await DI.orm.close(true);
    DI.server.close();
  });

// --- POST /paypal/pay/:bookingId---

  it('should return 200 and a payment link', async () => {
    const res = await request(DI.server)
      .post(`/paypal/pay/${booking.id}`)
      .send({ bookingId: booking.id });

    expect(200);
    expect(res.body.id).toBeDefined();
    expect(res.body.url).toBeDefined();
  });

  it('should return 400 if the booking does not exist', async () => {
    const res = await request(DI.server)
      .post(`/paypal/pay/0`)
      .send({ bookingId: 0 });

    expect(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toBe('Error creating PayPal order');
  });

  // --- GET /paypal/complete-order---

  it('should return 200 and a success message', async () => {
    const {token} = await paypalToken();
    const res = await request(DI.server)
      .get('/paypal/complete-order')
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(200);

  });

});