import {
    Cascade,
    Collection,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryKey,
    Property
} from '@mikro-orm/core';
import {User} from './User';
import {Booking} from './Booking';
import {number, object, string} from 'yup';
import {v4} from "uuid";

export enum VehicleType {
    Car = 'car',
    Bike = 'bike',
    EScooter = 'escooter',
}

@Entity()
export class Vehicle {
    @PrimaryKey()
    id: string = v4();

    @Property()
    brand!: string;

    @Property()
    model!: string;

    @Property()
    pricePerHour?: number;

    @Property()
    available?: boolean;

    @ManyToOne(() => User, { nullable: false })
    owner!: User;

    @OneToMany(() => Booking, (e: Booking) => e.vehicle,  { orphanRemoval: true, cascade: [Cascade.REMOVE] })
    bookings= new Collection<Booking>(this);

    @Property()
    city!: string;

    @Property({ nullable: true })
    rating?: number;

    @Property({ nullable: true })
    picture?: string;

    @Property()
    type!: VehicleType; // Use enum to denote type (car, bike, escooter)


    constructor({brand, model, pricePerHour, available, city, picture, type, owner}: CreateVehicleDTO) {

            this.brand = brand;
            this.model = model;
            this.pricePerHour = pricePerHour;
            this.available = available;
            this.city = city;
            this.picture = picture;
            this.type = type;
            this.owner = owner;

    }
}

export const CreateVehicleSchema = object({
    brand: string().required(),
    model: string().required(),
    type: string().oneOf(Object.values(VehicleType)).required(),
    pricePerHour: number().required(),
    city: string().required(),

});

export type CreateVehicleDTO = {
    brand: string;
    model: string;
    type: VehicleType;
    pricePerHour: number;
    available?: boolean;
    city: string;
    picture?: string;
    owner: User;
};
