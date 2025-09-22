import dotenv from 'dotenv';


dotenv.config();
import * as process from "process";
import {defineConfig, PostgreSqlDriver} from "@mikro-orm/postgresql";
import {Booking} from './entities/Booking';
import {User} from "./entities/User";
import {Vehicle} from "./entities/Vehicle";
import { Options } from '@mikro-orm/core';
//import { SeedManager } from '@mikro-orm/seeder';


let options: Options;
options = {
  dbName: process.env.DB_NAME,
  debug: process.env.DB_DEBUG === 'true' || process.env.DB_DEBUG === '1',
  entities: [Booking, User, Vehicle],
  password: process.env.DB_PASSWORD,
  driver: PostgreSqlDriver,
  user: process.env.DB_USER,
};

export default options;

