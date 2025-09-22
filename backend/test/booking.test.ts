// @ts-ignore
import request from 'supertest';
import * as express from 'express';



const { CreateBookingSchema } = require('../src/entities/Booking');

const router = express.Router();
import { Auth } from '../src/middleware/auth.middleware';
import * as multer from 'multer';
import {DI, startServer} from "../src/index";
import {CreateVehicleDTO, CreateVehicleSchema} from "../src/entities/Vehicle";
import {CreateBookingDTO} from "../src/entities/Booking";
import {Vehicle} from "../src/entities/Vehicle";
import {User} from "../src/entities/User";
import {EntityManager, EntityRepository, MikroORM, wrap} from "@mikro-orm/core";
import  {sendMails} from "../src/middleware/sendMail";
import {loginUser, newBooking} from './helper';
import {
  BookingController,
} from "../src/controllers/booking.controller";
import {TestSeeder} from "../src/Seeders/TestSeeder";
import mikroOrmConfig from "../src/mikro-orm.config";


export enum VehicleType {
  Car = 'car',
  Bike = 'bike',
  EScooter = 'escooter',
}


describe('POST /:userID/:vehicleID', () => {
  let vehicletype: VehicleType;
  let userRepository: EntityRepository<User>;
  let vehicleRepository: EntityRepository<Vehicle>;
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
      password:'nhj'
    });
    await emFork.persistAndFlush(owner);

    vehicle = vehicleRepository.create({
      brand: 'ec',
      model:'erf',
      owner:owner,
      bookings:[],
      city:'yde',
      type:vehicletype,
      pricePerHour:10,
      available:true,
      rating:4
    });
    await emFork.persistAndFlush(vehicle);
    //await seeder.seed(TestSeeder);
  });


   //beforeEach(() => {


    //const mockVehicle: Vehicle = { id: 'vehicleID', brand: '', model:'', owner:owner, bookings:null, city:'', type:null/* autres propriétés nécessaires */ };
    //const mockUser: User = { id: 'userID', email: 'user@example.com', username: 'username', password:'', vehicles:null, bookings:null /* autres propriétés nécessaires */ };

    // Mock des dépendances
    // jest.spyOn(DI.vehicleRepository, 'findOne').mockResolvedValue(vehicle);
    // jest.spyOn(DI.userRepository, 'findOne').mockResolvedValue(owner);
    // jest.spyOn(DI.em, 'persistAndFlush').mockResolvedValue(undefined);
    // jest.spyOn(BookingController, 'checkForBookingConflicts').mockResolvedValue(false);
    // jest.spyOn(BookingController, 'validateBookingTimes').mockReturnValue(true);
    // jest.spyOn(sendMails, 'sendMail').mockResolvedValue(undefined);
    // jest.spyOn(Auth, 'generateToken').mockReturnValue('mocked_jwt');
  //});

  // afterEach(() => {
  //   jest.restoreAllMocks();
  // });

  afterAll(async () => {
    await DI.orm.close(true);
    DI.server.close();
  });

  // --- POST /bookings/:userID/:vehicleID---

  it('should create a booking and return a JWT token', async () => {
    const { token } = await loginUser();
    const response = await request(DI.server)
    .post(`/bookings/${owner.id}/${vehicle.id}`)
    .set('Authorization', token)
    .send({
      startTime: (new Date('2025-01-01T06:30:00')).toISOString(),
      endTime: (new Date('2025-01-01T12:30:00')).toISOString(),
      totalPrice: 100,
      isPaid: false
    });

    expect(response.status).toBe(201);
    //expect(response.body).toHaveProperty([], {"errors": ["You don't have access"]});
  });

  it('should return a 400 error for invalid input', async () => {
    //jest.spyOn(CreateBookingSchema, 'validate').mockRejectedValue({ errors: ['Invalid input'] });

    const { token } = await loginUser();
    const response = await request(DI.server)
    .post(`/bookings/${owner.id}/${vehicle.id}`)
    .set('Authorization', token)
    .send({
      startTime: null, // invalid data
      endTime: new Date(),
      totalPrice: 100,
      isPaid: false
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors', ['startTime is a required field']);
  });

  it('should return a 401 error if the the token is false', async () => {
    const  token  = "mocked_jwt";
    const response = await request(DI.server)
    .post(`/bookings/${owner.id}/${vehicle.id}`)
    .set('Authorization', token)
    .send({
      startTime: (new Date('2025-01-01T06:30:00')).toISOString(),
      endTime: (new Date('2025-01-01T12:30:00')).toISOString(),
      totalPrice: 100,
      isPaid: false
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('errors', ['You don\'t have access']);
  });

  // --- PUT /bookings/:id---

  it('should return 400 error if a time not match', async () => {
    const { booking } = await newBooking();
    const { token } = await loginUser();
    const response = await request(DI.server)
    .put(`/bookings/${booking}`)
    .set('Authorization', token)
    .send({
      startTime: (new Date('2025-01-01T06:30:00')).toISOString(),
      endTime: (new Date('2025-01-01T05:30:00')).toISOString(),
      totalPrice: 300,
      isPaid: false
    });

    expect(response.status).toBe(400);
  });

  it('should update a booking and return a JWT token', async () => {
    const { booking } = await newBooking();
    const { token } = await loginUser();
    const response = await request(DI.server)
    .put(`/bookings/${booking}`)
    .set('Authorization', token)
    .send({
      startTime: (new Date('2026-01-01T06:30:00')).toISOString(),
      endTime: (new Date('2026-01-01T12:30:00')).toISOString(),
      totalPrice: 100,
      isPaid: false
    });

    expect(response.status).toBe(200);
  });

  it('should return 404 error if the booking is not found', async () => {
    const { booking } = await newBooking();
    const { token } = await loginUser();
    const response = await request(DI.server)
    .put(`/bookings/id`)
    .set('Authorization', token)
    .send({
      startTime: (new Date('2025-01-01T06:30:00')).toISOString(),
      endTime: (new Date('2025-01-01T12:30:00')).toISOString(),
      totalPrice: 300,
      isPaid: false
    });

    expect(response.status).toBe(404);
  });

    // --- GET /bookings/:id---

    it('should return a booking', async () => {
      const { booking } = await newBooking();
      const { token } = await loginUser();
      const response = await request(DI.server)
      .get(`/bookings/${booking}`)
      .set('Authorization', token);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', booking);
      expect(response.body).toEqual({

                id: booking,
                startTime: (new Date('2026-01-01T06:30:00')).toISOString(),
                endTime: (new Date('2026-01-01T12:30:00')).toISOString(),
                totalPrice: 100,
                isPaid: false,
                renter: owner.id,
                vehicle: vehicle.id,
                status: 'booked'


          }
      );
    });

    it('should return 404 error if the booking is not found', async () => {
      const { booking } = await newBooking();
      const { token } = await loginUser();
      const response = await request(DI.server)
      .get(`/bookings/id`)
      .set('Authorization', token);

      expect(response.status).toBe(404);
    });

  // --- GET /bookings/booking/users/:id---

    it('should return a booking', async () => {
      const { booking } = await newBooking();
      const { token } = await loginUser();
      const response = await request(DI.server)
      .get(`/bookings/booking/users/${owner.id}`)
      .set('Authorization', token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([{
        id: booking,
        startTime: (new Date('2026-01-01T06:30:00')).toISOString(),
        endTime: (new Date('2026-01-01T12:30:00')).toISOString(),
        totalPrice: 100,
        isPaid: false,
        renter:{
          id: owner.id,
          email: "meisazc31@gmail.com",
          image: null,
          password:"nhj",
          paypalEmail:null,
          username:"username"
      },
        vehicle: {
          id: vehicle.id,
          available: true,
          brand: "ec",
          city:"yde",
          model:"erf",
          owner: owner.id,
          picture:null,
          pricePerHour:10,
          rating:4,
          type:"car"
        },
        status: 'booked'
      }]);
    });

    it('should return 404 error if the booking is not found', async () => {
      const { booking } = await newBooking();
      const { token } = await loginUser();
      const response = await request(DI.server)
      .get(`/bookings/booking/user/id`)
      .set('Authorization', token);

      expect(response.status).toBe(404);
    });

    // --- DELETE /bookings/:id---

    it('should delete a booking', async () => {
      const { booking } = await newBooking();
      const { token } = await loginUser();
      const response = await request(DI.server)
      .delete(`/bookings/${booking}`)
      .set('Authorization', token);

      expect(response.status).toBe(200);
    });
});