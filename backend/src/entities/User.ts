import {Entity, PrimaryKey, Property, OneToMany, Collection, Cascade} from '@mikro-orm/core';
import { Vehicle } from './Vehicle';
import { Booking } from './Booking';
import { object, string } from 'yup';
import {v4} from "uuid";

@Entity()
export class User {
    @PrimaryKey()
    id: string = v4();

    @Property()
    username!: string;

    @Property()
    password!: string;

    @Property()
    email!: string;

    @Property({ nullable: true })
    image?: string;

    @Property({ nullable: true })
    paypalEmail?: string;

    @OneToMany(() => Vehicle, vehicle => vehicle.owner)
    vehicles = new Collection<Vehicle>(this);

    @OneToMany(() => Booking, booking => booking.renter,  { orphanRemoval: true, cascade: [Cascade.REMOVE] })
    bookings = new Collection<Booking>(this);

    constructor({ username, password, email, image, paypalEmail }: CreateUserDTO) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.image = image;
        this.paypalEmail =  paypalEmail;
    }
}

export const CreateUserSchema = object({
    username: string().required(),
    password: string().required(),
    email: string().required(),
});

export type CreateUserDTO = {
    username: string;
    password: string;
    email: string;
    image?: string;
    paypalEmail ?: string;
};
