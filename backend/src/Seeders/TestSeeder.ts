import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User } from '../entities/User';
import { Auth } from '../middleware/auth.middleware';
import {Vehicle} from "../entities/Vehicle";

export enum VehicleType {
  Car = 'car',
  Bike = 'bike',
  EScooter = 'escooter',
}

export class TestSeeder extends Seeder {

  vehicleType: VehicleType;
  async run(em: EntityManager): Promise<void> {
    const hashedPassword = await Auth.hashPassword('123456');
    this.vehicleType = VehicleType.Car;
    const user = em.create(User, {
      email: 'hallo123@fwe345.de',
      password: hashedPassword,
      username: 'rideshare',
    });

    const vehicle = em.create(Vehicle, {
      owner: user,
      type: this.vehicleType,
      brand: 'BMW',
      model: 'X5',
      city: 'Berlin',
    });
  }
}
