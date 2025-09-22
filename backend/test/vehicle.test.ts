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
import {Booking} from "../src/entities/Booking";
import {User} from "../src/entities/User";
import {EntityManager, EntityRepository, MikroORM, wrap} from "@mikro-orm/core";
import  {sendMails} from "../src/middleware/sendMail";
import {loginUser, newBooking, newVehicle} from './helper';
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


describe('POST /:id', () => {
  let vehicletype: VehicleType;
  let userRepository: EntityRepository<User>;
  // let vehicleRepository: EntityRepository<Vehicle>;
  // let vehicle: Vehicle;
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


     emFork = await DI.orm.em.fork(); // Forks the EntityManager

    vehicletype = VehicleType.Car;
    userRepository = await  emFork.getRepository(User);
    //vehicleRepository = emFork.getRepository(Vehicle);
    owner = userRepository.create({
      email: 'meisazc31@gmail.com',
      username: 'username',
      password:'nhj'
    });
    await emFork.persistAndFlush(owner);

    // vehicle = vehicleRepository.create({
    //   brand: 'ec',
    //   model:'erf',
    //   owner:owner,
    //   bookings:[],
    //   city:'yde',
    //   type:vehicletype,
    //   pricePerHour:10,
    //   available:true,
    //   rating:4
    // });
    // await emFork.persistAndFlush(vehicle);
    //await seeder.seed(TestSeeder);
  });




  afterAll(async () => {

    await DI.orm.close(true);

    await new Promise<void>((resolve, reject) => {
      DI.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Serveur fermé après les tests.');
          resolve();
        }
      });
    });

    //  DI.server.close(() => {
    //   console.log('Serveur fermé après les tests.');
    // });
  });

  // --- POST /vehicles/:id---

  it('should create a vehicle and return a JWT token', async () => {
    const { token } = await loginUser();
    const response = await request(DI.server)
    .post(`/vehicles/${owner.id}`)
    .set('Authorization', token)
    .send({
      available: true,
      brand: "ec",
      city:"yde",
      model:"erf",
      picture:null,
      pricePerHour:10,
      rating:4,
      type:"car"
    });

    expect(response.status).toBe(201);
  });

  it('should return a 400 error for invalid input', async () => {


    const { token } = await loginUser();
    const response = await request(DI.server)
    .post(`/vehicles/${owner.id}`)
    .set('Authorization', token)
    .send({
      available: true,
      brand: "ec",
      city:"yde",
      model:"erf",
      picture:null,
      pricePerHour:"hey",
      rating:4,
      type:"mdr"
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors', ['pricePerHour must be a `number` type, but the final value was: `NaN` (cast from the value `\"hey\"`).']);
  });

  it('should return a 401 error if the the token is false', async () => {
    const  token  = "mocked_jwt";
    const response = await request(DI.server)
    .post(`/vehicles/${owner.id}`)
    .set('Authorization', token)
    .send({
      available: true,
      brand: "ec",
      city:"yde",
      model:"erf",
      picture:null,
      pricePerHour:10,
      rating:4,
      type:"car"
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('errors', ['You don\'t have access']);
  });

  // --- PUT /vehicles/:id---

  it('should update a vehicle and return a JWT token', async () => {
    const { vehicle } = await newVehicle();
    const { token } = await loginUser();
    const response = await request(DI.server)
    .put(`/vehicles/${vehicle}`)
    .set('Authorization', token)
    .send({
      available: true,
      brand: "ec",
      city:"yde",
      model:"erf",
      picture:null,
      pricePerHour:20,
      rating:4,
      type:"car"
    });

    expect(response.status).toBe(200);
  });

  it('should return 404 error if the vehicle is not found', async () => {
    const { token } = await loginUser();
    const response = await request(DI.server)
    .put(`/vehicles/id`)
    .set('Authorization', token)
    .send({
      available: true,
      brand: "ec",
      city:"yde",
      model:"erf",
      picture:null,
      pricePerHour:10,
      rating:4,
      type:"car"
    });

    expect(response.status).toBe(404);
  });

  // --- GET /vehicles/---

  it('should return all vehicles', async () => {
    const { vehicle } = await newVehicle();
    const { token } = await loginUser();
    const response = await request(DI.server)
    .get(`/vehicles/`)
    .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
  {
      id: vehicle,
      bookings:[],
      available: true,
      brand: "ec",
      city:"yde",
      model:"erf",
      picture:null,
      pricePerHour:20,
      rating:4,
      type:"car",
      owner: {
        id: owner.id,
        email: "meisazc31@gmail.com",
        image: null,
        password: "nhj",
        paypalEmail: null,
        username: "username"
      },
  }
        ]
    );
  });

  it('should return 404 error if the vehicle is not found', async () => {
    const { token } = await loginUser();
    const response = await request(DI.server)
    .get(`/vehicles/id`)
    .set('Authorization', token);

    expect(response.status).toBe(404);
  });

  // // --- GET /vehicles/vehicle/:type---

  it('should return all vehicle for the type', async () => {
    const { vehicle } = await newVehicle();
    const { token } = await loginUser();
    const response = await request(DI.server)
    .get(`/vehicles/vehicle/${VehicleType.Bike}`)
    .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });


  // --- DELETE /vehicles/:id---

  it('should delete a vehicle', async () => {
    const { vehicle } = await newVehicle();
    const { token } = await loginUser();
    const response = await request(DI.server)
    .delete(`/vehicles/${vehicle}`)
    .set('Authorization', token);

    expect(response.status).toBe(200);
  });
});