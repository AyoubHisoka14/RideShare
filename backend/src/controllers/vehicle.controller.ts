import * as express  from 'express';
import * as jwt from 'jsonwebtoken';
import * as path from 'path'; // Import path for handling file paths
import * as fs from 'fs'; // Import fs for file system operations
import {MikroORM, wrap} from '@mikro-orm/core';
import { User, CreateUserDTO, CreateUserSchema } from '../entities/User'; // Adjust path as per your project structure
import {authenticateJWT} from "../routes/userRoutes/authenticateJWT";
import {DI} from "../index";
import {Booking} from "../entities/Booking";
import multer from 'multer';
import {SignOptions} from "jsonwebtoken";
import {CreateVehicleDTO, CreateVehicleSchema, Vehicle, VehicleType} from "../entities/Vehicle";
import {Request, Response} from "express"; // Import multer for file uploads
const router = express.Router();
import {sendMails} from "../middleware/sendMail";
import { Auth } from '../middleware/auth.middleware';
const SECRET_KEY = 'your_secret_key'; // Replace with a strong secret key
// const JWT_OPTIONS: SignOptions = {
//   expiresIn: 3600, // in seconds
//   issuer: 'http://fwe.auth',
// };

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/uploads/'); // Upload files to 'backend/uploads/' directory
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`); // Generate unique filename using current timestamp
  }
});

const upload = multer({ storage });

router.get('/', async (req: Request, res: Response) => {
  try {
    const vehicles = await DI.vehicleRepository.findAll(
        {populate:['bookings', 'owner']}
    );
    res.status(200).send(vehicles);
  } catch (error) {
    console.log(error)
    res.status(400).json({ errors: error.errors });
  }
});

router.post('/:id', upload.single('image'), async (req, res) => {
  try {
    DI.orm = await MikroORM.init();
    DI.em = DI.orm.em;
    const validatedData = await CreateVehicleSchema.validate(req.body).catch((e) => {
      console.error(e);
      res.status(400).json({ errors: e.errors });
    });

    if (!validatedData) {
      return;
    }
    console.log("reached");

    const owner = await DI.userRepository.findOne({ id: req.params.id });

    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    const createVehicleDTO : CreateVehicleDTO = {
      ... validatedData,
      picture: req.file ? `/uploads/${req.file.filename}` : undefined,
      available: true,
      owner: owner
    }


    //const newVehicle = new Vehicle(createVehicleDTO);
    let newVehicle = new Vehicle(createVehicleDTO);
    newVehicle = DI.em.create(Vehicle, createVehicleDTO);




    //wrap(newVehicle).assign({owner: owner}, { em: DI.em });
    newVehicle.owner = owner;

    const jwt = Auth.generateToken({
      email: owner.email,
      username: owner.username,
      id: owner.id,
    });


    await DI.em.persistAndFlush(newVehicle);


    // await sendMails.sendMail(
    //     owner.email,
    //     "Your Vehicle is Now Ready for Rent!",
    //     `   Dear ${owner.username},
    //
    //         Congratulations! Your vehicle has been successfully registered on Rideshare and is now available for rent. We're excited to help you share your vehicle with our community and start earning income.
    //
    //         Vehicle Details:
    //         ---------------------
    //         Type: ${newVehicle.type}
    //         Brand: ${newVehicle.brand}
    //         Model: ${newVehicle.model}
    //         Registration Date: ${new Date().toLocaleDateString()}
    //
    //         What to Expect Next:
    //         ---------------------
    //         - Potential renters will be able to view your vehicle and make bookings.
    //         - You will receive notifications whenever someone rents your vehicle.
    //         - Keep an eye on your dashboard for rental requests and updates.
    //
    //         Tips to Maximize Your Earnings:
    //         ---------------------
    //         - Make sure to provide clear and accurate descriptions of your vehicle.
    //         - Upload high-quality photos to attract more renters.
    //         - Regularly update the availability of your vehicle to ensure smooth rentals.
    //
    //         We're here to support you on your journey with Rideshare.
    //
    //         Best regards,
    //         The Rideshare Team
    //
    //         ---------------------
    //         This is an automated message, please do not reply to this email.`,
    //
    //     `<h1 style='color: cornflowerblue'> Dear ${owner.username},</h1>
    //           <p>Congratulations! Your vehicle has been successfully registered on Rideshare and is now available for rent. We're excited to help you share your vehicle with our community and start earning income.</p>
    //           <h2 style='color: deepskyblue'>Vehicle Details:</h2>
    //           -------------------------------
    //           <p><strong style='color: cornflowerblue'>Type:</strong> ${newVehicle.type}</p>
    //           <p><strong style='color: cornflowerblue'>Brand:</strong> ${newVehicle.brand}</p>
    //           <p><strong style='color: cornflowerblue'>Model:</strong> ${newVehicle.model}</p>
    //           <p><strong style='color: cornflowerblue'>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
    //           <h2 style='color: deepskyblue'>What to Expect Next:</h2>
    //           -------------------------------
    //           <p>- Potential renters will be able to view your vehicle and make bookings.</p>
    //           <p>- You will receive notifications whenever someone rents your vehicle.</p>
    //           <p>- Keep an eye on your dashboard for rental requests and updates.</p>
    //           <h2 style='color: deepskyblue'>Tips to Maximize Your Earnings:</h2>
    //           -------------------------------
    //           <p>- Make sure to provide clear and accurate descriptions of your vehicle.</p>
    //           <p>- Upload high-quality photos to attract more renters.</p>
    //           <p>- Regularly update the availability of your vehicle to ensure smooth rentals.</p>
    //           <p>We're here to support you on your journey with Rideshare.</p>
    //           <p>Best regards,</p>
    //           <p style='color: deepskyblue'>The Rideshare Team</p>
    //           -------------------------------
    //           <p>This is an automated message, please do not reply to this email.</p>`
    // );



    await DI.vehicleRepository.populate(newVehicle, ['owner']);
    res.status(201).send({ accessToken: jwt });

  } catch (error) {
    console.log(error)
    res.status(400).json({ errors: error.errors });
  }
});

router.get('/vehicle', async (req , res) => {
  try {
    const vehicles = await DI.vehicleRepository.findAll({
      populate: ['owner', 'bookings']
    });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/vehicle/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const available = req.query.available === 'true';

    // Check if the provided type is valid
    if (!Object.values(VehicleType).includes(type as VehicleType)) {
      return res.status(400).json({ message: 'Invalid vehicle type' });
    }

    // Cast type to VehicleType
    const vehicleType = type as VehicleType;

    // Fetch vehicles based on type and availability
    const vehicles = await DI.vehicleRepository.find({ type: vehicleType, available }, {
      populate: ['owner', 'bookings']
    });

    res.status(200).send(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/vehicle/:owner', async (req, res) => {
  try {
    const { owner } = req.params;

    // Check if the provided user ID is valid
    if ((req.user as any).id !== owner) {
      return res.status(403).json({ message: 'Access denied. You can only view your own vehicles.' });
    }

    // Fetch vehicles based on the provided user ID
    const vehicles = await DI.vehicleRepository.find( {owner: owner},
        {populate:['bookings', 'owner']});

    if (!vehicles) {
      return res.status(404).json({ message: 'Vehicles not found' });
    }

    res.status(200).send(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const vehicleData = req.body;

    // Find the vehicle by ID
    const vehicle = await DI.vehicleRepository.findOne({ id:id }, { populate: ['owner'] });
    const owner = await DI.userRepository.findOne({ id: vehicle?.owner.id });
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    wrap(vehicle).assign(vehicleData);
    if(req.file) {
      vehicle.picture = `/uploads/${req.file.filename}`;
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

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the vehicle by ID
    const vehicle = await DI.vehicleRepository.findOne({ id }, { populate: ['owner'] });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    await vehicle.bookings.init();

    // Check if there are any unpaid bookings
    const hasUnpaidBookings = vehicle.bookings.getItems().some(booking => !booking.isPaid);

    if (hasUnpaidBookings) {
      return res.status(400).json({ message: 'This Booking still has ongoing Bookings' });
    }

    // Remove the vehicle without removing the owner
    await DI.em.removeAndFlush(vehicle);

    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});



export const VehicleController = router;
