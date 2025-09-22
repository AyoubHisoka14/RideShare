import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as path from 'path'; // Import path for handling file paths
import * as fs from 'fs'; // Import fs for file system operations
const { User } = require('../entities/User');
const { Vehicle } = require('../entities/Vehicle');
const { Booking, CreateBookingSchema } = require('../entities/Booking');
import {authenticateJWT} from "../routes/userRoutes/authenticateJWT";
const router = express.Router();
import { Auth } from '../middleware/auth.middleware';
import * as multer from 'multer';
import {DI} from "../index";
import {CreateVehicleDTO, CreateVehicleSchema} from "../entities/Vehicle";
import {CreateBookingDTO} from "../entities/Booking";
import {EntityManager, MikroORM, wrap} from "@mikro-orm/core";
import {sendMails} from "../middleware/sendMail";
import process from "process";
const SECRET_KEY = 'your_secret_key';


 const checkForBookingConflicts = async (
    em: EntityManager, // Passe l'EntityManager en argument
    newBooking: CreateBookingDTO,
    vehicleId: string,
    oldBookingId: string,
): Promise<boolean> => {
  const relevantEndTime = newBooking.endTime;

  const overlappingBookings = await em.count(Booking, {
    $and: [
      { vehicle: vehicleId },
      { id: { $ne: oldBookingId } },
      {
        $or: [
          {
            startTime: {
              $gte: newBooking.startTime,
              $lte: relevantEndTime
            }
          },
          {
            endTime: {
              $gte: newBooking.startTime,
              $lte: relevantEndTime
            }
          },
          {
            startTime: {
              $lte: newBooking.startTime
            },
            endTime: {
              $gte: relevantEndTime
            }
          }
        ]
      }
    ]
  });
  return overlappingBookings > 0;
};

 const validateBookingTimes = (startTime: Date, endTime: Date): boolean => {
  const now = new Date();

  if (startTime > endTime) {
    console.log('Start time is greater than end time.');
    return false;
  }

  if (startTime < now) {
    console.log('Start time is in the past.');
    return false;
  }

  return true;
};

//const emFork = DI.orm.em.fork();

router.post('/:userID/:vehicleID', async (req, res) => {
  try {
    DI.orm = await MikroORM.init();
    DI.em = DI.orm.em;
    const validatedData = await CreateBookingSchema.validate(req.body).catch((e: { errors: any; }) => {
      console.error(e);
      res.status(400).json({ errors: e.errors });
    });
    if (!validatedData) {
      return;
    }
    console.log(validatedData);
    const createBookingDTO : CreateBookingDTO = {
      ... validatedData,
      status: 'booked'
    }

    const vehicle = await DI.vehicleRepository.findOne({ id: req.params.vehicleID });
    const renter = await DI.userRepository.findOne({ id: req.params.userID });

    if (!vehicle) {
      return res.status(400).json({ message: 'Invalid vehicle or renter ID' });
    }
    if (!renter) {
      return res.status(400).json({ message: 'Owner not found' });
    }

    const newOwner = await DI.userRepository.findOne({ id: vehicle.owner.id });

    if (!newOwner) {
      return res.status(400).json({ message: 'Owner not found' });
    }

    let newBooking = new Booking(createBookingDTO);
     newBooking = DI.em.create(Booking, createBookingDTO);

    console.log(newBooking.startTime);

    const bookingConflicts = await checkForBookingConflicts(DI.em, newBooking, req.params.vehicleID, '');
    const validTimes = validateBookingTimes(newBooking.startTime, newBooking.endTime);

    //wrap(newBooking).assign({renter: renter, vehicle: vehicle}, { em: DI.em });
    newBooking.renter = renter; // Assign renter to booking
    newBooking.vehicle = vehicle;
    if (bookingConflicts) {
      return res.status(400).json({ message: 'Booking conflicts with existing bookings' });
    }
    if (!validTimes) {
      return res.status(400).json({ message: 'Invalid booking times' });
    }
    await DI.em.persistAndFlush(newBooking);


      // formerly in-app push message
    //   await sendMails.sendMail(
    //       renter.email,
    //       "New Booking",
    //       `   Dear ${renter.username},
    //
    // Thank you for your booking with us! We are pleased to confirm your reservation with the following details:
    //
    // Booking Details:
    // ---------------------
    // Vehicle: ${vehicle.brand} ${vehicle.model}
    // Rental Start Date: ${newBooking.startTime}
    // Rental End Date: ${newBooking.endTime}
    // Total Price: $${newBooking.totalPrice.toFixed(2)}
    //
    //  Location:
    // ---------------------
    // ${vehicle.type}
    //
    //
    //
    // Additional Information:
    // ---------------------
    // - Please ensure you have your driver's license and the credit card used for the booking with you at the time of pickup.
    // - Our office hours are from 9:00 AM to 6:00 PM, Monday to Friday.
    // - If you have any questions or need to make changes to your booking, please contact us at ${process.env.SMTP_USER}.
    //
    // We look forward to serving you and hope you have a great experience with our service.
    //
    // Best regards,
    // The Rideshare Team
    //
    // ---------------------
    // This is an automated message, please do not reply to this email.`,
    //
    //       `<h1 style='color: cornflowerblue'> Dear ${renter.username},</h1>
    //       <p>Thank you for your booking with us! We are pleased to confirm your reservation with the following details:</p>
    //       <h2 style='color: deepskyblue'>Booking Details:</h2>
    //       -------------------------------
    //       <p><strong style='color: cornflowerblue'>Vehicle:</strong> ${vehicle.brand} ${vehicle.model}</p>
    //       <p><strong style='color: cornflowerblue'>Rental Start Date:</strong> ${newBooking.startTime}</p>
    //       <p><strong style='color: cornflowerblue'>Rental End Date:</strong> ${newBooking.endTime}</p>
    //       <p><strong style='color: cornflowerblue'>Total Price:</strong> $${newBooking.totalPrice.toFixed(2)}</p>
    //       <h2 style='color: deepskyblue'>Location:</h2>
    //       ------------------------------
    //       <p>${vehicle.type}</p>
    //       <h2 style='color: deepskyblue'>Additional Information:</h2>
    //       -------------------------------
    //       <p>- Please ensure you have your driver's license and the credit card used for the booking with you at the time of pickup.</p>
    //       <p>- Our office hours are from 9:00 AM to 6:00 PM, Monday to Friday.</p>
    //       <p>- If you have any questions or need to make changes to your booking, please contact us at ${process.env.SMTP_USER}.</p>
    //       <p>We look forward to serving you and hope you have a great experience with our service.</p>
    //       <p>Best regards,</p>
    //       <p style='color: deepskyblue'>The Rideshare Team</p>
    //       -------------------------------
    //       <p>This is an automated message, please do not reply to this email.</p>`
    //
    //   );
    //
    //   await sendMails.sendMail(
    //       vehicle.owner.email,
    //       "New Booking",
    //       `   Dear ${vehicle.owner.username},
    //
    // A new booking has been made on your vehicle with the following details:
    //
    // Booking Details:
    // ---------------------
    // Vehicle: ${vehicle.brand} ${vehicle.model}
    // Rental Start Date: ${newBooking.startTime}
    // Rental End Date: ${newBooking.endTime}
    // Total Price: $${newBooking.totalPrice.toFixed(2)}
    //
    //  Location:
    // ---------------------
    // ${vehicle.type}
    //
    //
    //
    // Additional Information:
    // ---------------------
    // - Please ensure you have your driver's license and the credit card used for the booking with you at the time of pickup.
    // - Our office hours are from 9:00 AM to 6:00 PM, Monday to Friday.
    // - If you have any questions or need to make changes to your booking, please contact us at ${process.env.SMTP_USER}.
    //
    // We look forward to serving you and hope you have a great experience with our service.
    //
    // Best regards,
    // The Rideshare Team
    //
    // ---------------------
    // This is an automated message, please do not reply to this email.`,
    //
    //       `<h1 style='color: cornflowerblue'> Dear ${vehicle.owner.username},</h1>
    //       <p>A new booking has been made on your vehicle with the following details:</p>
    //       <h2 style='color: deepskyblue'>Booking Details:</h2>
    //       -------------------------------
    //       <p><strong style='color: cornflowerblue'>Vehicle:</strong> ${vehicle.brand} ${vehicle.model}</p>
    //       <p><strong style='color: cornflowerblue'>Rental Start Date:</strong> ${newBooking.startTime}</p>
    //       <p><strong style='color: cornflowerblue'>Rental End Date:</strong> ${newBooking.endTime}</p>
    //       <p><strong style='color: cornflowerblue'>Total Price:</strong> $${newBooking.totalPrice.toFixed(2)}</p>
    //       <h2 style='color: deepskyblue'>Location:</h2>
    //       ------------------------------
    //       <p>${vehicle.type}</p>
    //       <h2 style='color: deepskyblue'>Additional Information:</h2>
    //       -------------------------------
    //       <p>- Please ensure you have your driver's license and the credit card used for the booking with you at the time of pickup.</p>
    //       <p>- Our office hours are from 9:00 AM to 6:00 PM, Monday to Friday.</p>
    //       <p>- If you have any questions or need to make changes to your booking, please contact us at ${process.env.SMTP_USER}.</p>
    //       <p>We look forward to serving you and hope you have a great experience with our service.</p>
    //       <p>Best regards,</p>
    //       <p style='color: deepskyblue'>The Rideshare Team</p>
    //       -------------------------------
    //       <p>This is an automated message, please do not reply to this email.</p>`
    //
    //   );


    const jwt = Auth.generateToken({
      email: renter.email,
      username: renter.username,
      id: renter.id,
    });

    //await DI.vehicleRepository.populate(newBooking, ['renter']);
    res.status(201).send({ accessToken: jwt });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/:id/dashboard', async (req , res) => {
  try {
    const ownerId = req.params.id;

    // Fetch all bookings with vehicle details populated
    const bookings = await DI.bookingRepository.findAll({
      populate: ['vehicle', 'renter']
    });

    // Filter bookings where vehicle.owner matches ownerId
    // @ts-ignore
    const filteredBookings = bookings.filter(booking => booking.vehicle.owner.id == ownerId);

    res.json(filteredBookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/booking/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the provided user ID is valid
    if ((req.user as any).id !== id) {
      return res.status(403).json({ message: 'Access denied. You can only view your own vehicles.' });
    }

    // Fetch vehicles based on the provided user ID
    const booking = await DI.bookingRepository.find({ renter: id }, {
      populate: ['vehicle', 'renter']
    });

    res.status(200).send(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bookingData = req.body;
    let startTime = new Date();
    let endTime = new Date();

    // Find the vehicle by ID
    const booking = await DI.bookingRepository.findOne({ id: id });
    const owner = await DI.userRepository.findOne({ id: booking?.renter.id });

    if (!booking) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    // startTime = bookingData.startTime;
    // endTime = bookingData.endTime;

    wrap(booking).assign(bookingData);

    if(bookingData.startTime) {

    const bookingConflicts = await checkForBookingConflicts(DI.em, booking, <string>booking.vehicle?.id, id);
    const validTimes = validateBookingTimes(booking.startTime, booking.endTime);

    if (bookingConflicts) {
      console.log("x");
      return res.status(400).json({ message: 'Booking conflicts with existing bookings' });
    }
    if (!validTimes) {
      console.log("x");
      return res.status(400).json({ message: 'Invalid booking times' });
    }
  }

    await DI.em.flush();

    const jwt = Auth.generateToken({
      email: owner.email,
      username: owner.username,
      id: owner.id,
    });

    res.status(200).send({ accessToken: jwt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await DI.bookingRepository.findOne({ id: id });

    if (!booking) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the vehicle by ID
    const booking = await DI.bookingRepository.findOne({ id }, { populate: ['renter', 'vehicle'] });

    if (!booking) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Remove the vehicle without removing the owner
    await DI.em.removeAndFlush(booking);

    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export const BookingController = router;

