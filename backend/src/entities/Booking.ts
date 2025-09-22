import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { User } from './User';
import { Vehicle } from './Vehicle';
import { object, string, number, boolean, date } from 'yup';
import { v4 } from 'uuid';

export enum BookingStatus {
    Booked = 'booked',
    Running = 'running',
    Done = 'done',
}

@Entity()
export class Booking {
    @PrimaryKey()
    id: string = v4();

    @ManyToOne(() => Vehicle, { nullable: false })
    vehicle: Vehicle | undefined ;

    @ManyToOne(() => User, {nullable:false})
    renter: User;

    @Property({ type: 'datetime' })
    startTime!: Date;

    @Property({ type: 'datetime' })
    endTime!: Date;

    @Property({ type: 'number' })
    totalPrice!: number;

    @Property({ type: 'boolean', default: false })
    isPaid: boolean = false;

    @Property()
    status!: BookingStatus;

    constructor({startTime, endTime, totalPrice, status}: CreateBookingDTO) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.totalPrice = totalPrice;
        this.status = status;

    }
}

export const CreateBookingSchema = object({
    startTime: date().required(),
    endTime: date().required(),
    totalPrice: number().required().positive(),
});

export type CreateBookingDTO = {
    startTime: Date;
    endTime: Date;
    totalPrice: number;
    status: BookingStatus;
};
