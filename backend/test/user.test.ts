// @ts-ignore
import request from 'supertest';
import * as express from 'express';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';



const { CreateBookingSchema } = require('../src/entities/Booking');

const router = express.Router();

import {DI, startServer} from "../src";

import {updateUser} from './helper';

import {SignOptions} from "jsonwebtoken";

const JWT_OPTIONS: SignOptions = {
  expiresIn: 3600, // in seconds
  issuer: 'http://fwe.auth',
};

export enum VehicleType {
  Car = 'car',
  Bike = 'bike',
  EScooter = 'escooter',
}


describe('POST /:id', () => {


  beforeAll(async () => {
    await startServer();
    //const seeder = DI.orm.getSeeder();
    DI.orm.config.set('dbName', 'FWESS24RIDESHARE');
    DI.orm.config.getLogger().setDebugMode(false);
    DI.orm.config.set('allowGlobalContext', true);
    await DI.orm.config.getDriver().reconnect();
    await DI.orm.getSchemaGenerator().refreshDatabase();

    //const hashedPassword = await Auth.hashPassword('123456');

  });




  afterAll(async () => {

    await DI.orm.close(true);

    // await new Promise<void>((resolve, reject) => {
    //   DI.server.close((err) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       console.log('Serveur fermé après les tests.');
    //       resolve();
    //     }
    //   });
    // });

    DI.server.close();

    //  DI.server.close(() => {
    //   console.log('Serveur fermé après les tests.');
    // });
  });

  // --- POST /users/register---

  it('should create a user', async () => {
    //const { token } = await loginUser();
    const response = await request(DI.server)
    .post(`/users/register`)
    //.set('Authorization', token)
    .send({
      username: "mustermann",
      email: "example@gmail.com",
      password: "hello"
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('newUser');
    expect(response.body.newUser.id).toBeDefined();

  });

  it('should return a 400 error when data(username or email or password) are missing ', async () => {

    const response = await request(DI.server)
    .post(`/users/register`)
    .send({
      email: "example@gmail.com",
      password: "hello"
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors', ['username is a required field']);
  });

  // --- POST /users/login---

  it('should login a user and return a JWT token', async () => {
    const response = await request(DI.server)
    .post(`/users/login`)
    .send({
      email: "example@gmail.com",
      password: "hello"
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
  });

  it('should return a 401 error if the the password not match', async () => {
    const response = await request(DI.server)
    .post(`/users/login`)
    .send({
      email: "example@gmail.com",
      password: "hellogt"
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('errors', ['Invalid password']);
  });

  //  --- PUT /users/:id---

  it('should update a user', async () => {
    const {user} = await updateUser();
    const {password} = await updateUser();
    const response = await request(DI.server)
    .put(`/users/${user}`)
    .send({
      username: "mann",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: user,
      username: "mann",
      email: "example@gmail.com",
      image: null,
      bookings: [],
      vehicles: [],
      paypalEmail: null,
      password: password
    });
  });

  it('should return 404 error if the user is not found', async () => {
    const {user} = await updateUser();
    const {password} = await updateUser();
    const response = await request(DI.server)
    .put(`/users/:user`)
    .send({
      username: "mann",
    });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "User not found");
  });

   // --- GET /users/:id---

  it('should return a user', async () => {
    const {user} = await updateUser();
    const {password} = await updateUser();
    const response = await request(DI.server)
    .get(`/users/${user}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: user,
      username: "mann",
      email: "example@gmail.com",
      image: null,
      bookings: [],
      vehicles: [],
      paypalEmail: null,
      password: password
    });
  });

   // --- DELETE /users/:id---

  it('should delete a user', async () => {
    const {user} = await updateUser();
    const {password} = await updateUser();
    const response = await request(DI.server)
    .delete(`/users/${user}`);

    expect(response.status).toBe(204);
  });


});