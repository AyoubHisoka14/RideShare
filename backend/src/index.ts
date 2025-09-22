// src/index.ts
import dotenv from 'dotenv';

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();
import * as process from "process";
import express, { Application, Request, Response, NextFunction } from 'express';

import bodyParser from 'body-parser';
import {EntityManager, EntityRepository, MikroORM, RequestContext} from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import cors from 'cors';
import { User } from './entities/User';
import { Vehicle } from './entities/Vehicle';
import { Booking } from './entities/Booking';
import { Auth } from './middleware/auth.middleware';
import http from "http";
import {UserController} from "./controllers/user.controller";
import * as path from "node:path";
import {VehicleController} from "./controllers/vehicle.controller";
import {BookingController} from "./controllers/booking.controller";
import {PaypalController} from "./controllers/paypal.controller"; // Import consolidated vehicle router

const app: Application = express();
const PORT = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : undefined;

// Middleware
app.use(bodyParser.json());
app.use(cors());

let orm: MikroORM; // Define a variable to hold the ORM instance globally


export const DI = {} as {
    server: http.Server;
    orm: MikroORM;
    em: EntityManager;
    userRepository: EntityRepository<User>;
    bookingRepository: EntityRepository<Booking>;
    vehicleRepository: EntityRepository<Vehicle>;
};


// Start the server
export const startServer = async () => {

    DI.orm = await MikroORM.init();
    DI.em = DI.orm.em;
    DI.userRepository = DI.orm.em.getRepository(User);
    DI.vehicleRepository = DI.orm.em.getRepository(Vehicle);
    DI.bookingRepository = DI.orm.em.getRepository(Booking);


    // global middleware
    app.use(express.json());
    app.use((req, res, next) => RequestContext.create(DI.orm.em, next));
    app.use(Auth.prepareAuthentication);

    app.use('/uploads', express.static('src/uploads'));
    // routes
    app.use('/users', UserController);
    app.use('/vehicles', Auth.verifyAccess, VehicleController);
    app.use('/bookings', Auth.verifyAccess, BookingController);
    app.use('/paypal', PaypalController);

    DI.server = app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });

};

// Initialize ORM and start the server
if(process.env.environment !== 'test'){
    startServer();
}


