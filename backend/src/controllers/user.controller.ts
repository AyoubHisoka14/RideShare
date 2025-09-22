import express, { Request, Response } from 'express';
import jwt, {SignOptions} from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as path from 'path'; // Import path for handling file paths
import * as fs from 'fs'; // Import fs for file system operations
import {MikroORM, wrap} from '@mikro-orm/core';
import { User, CreateUserDTO, CreateUserSchema } from '../entities/User'; // Adjust path as per your project structure
import {authenticateJWT} from "../routes/userRoutes/authenticateJWT";
import {DI} from "../index";
import {Booking} from "../entities/Booking";
import multer from 'multer';
import process from "process"; // Import multer for file uploads
const router = express.Router();
import {sendMails} from "../middleware/sendMail";
const SECRET_KEY = process.env.SECRET; // Replace with a strong secret key
const JWT_OPTIONS: SignOptions = {
    expiresIn: 3600, // in seconds
    issuer: 'http://fwe.auth',
};

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
        const users = await DI.userRepository.findAll(
            {populate:['bookings', 'vehicles.bookings', 'vehicles']}
        );
        res.status(200).send(users);
    } catch (error) {
        console.log(error)
        res.status(400).json({ errors: error.errors });
    }
});

router.post('/register', upload.single('image'), async (req: Request, res: Response) => {
    try {
        const validatedData = await CreateUserSchema.validate(req.body, { abortEarly: false });

        const existingUser = await DI.userRepository.findOne({ email: validatedData.email });
        if (existingUser) {
            return res.status(400).json({ errors: ['Email is already registered'] });
        }

        const hashedPassword = await bcrypt.hash(validatedData.password, 10);
        console.log(`file: ${req.file}`);

        const createUserDTO : CreateUserDTO={
            ...validatedData,
            password: hashedPassword,
            image: req.file ? `/uploads/${req.file.filename}` : undefined, // Store image path in database if file uploaded
        };

        let newUser = new User(createUserDTO);
        newUser = DI.em.create(User, createUserDTO);

        await DI.em.persistAndFlush(newUser);

        // await sendMails.sendMail(
        //     newUser.email,
        //     "Welcome to Rideshare!",
        //     `   Dear ${newUser.username},
        //
        //             Welcome to Rideshare! We're thrilled to have you join our community. Your account has been successfully created, and you are now ready to explore all the features we offer.
        //
        //             Account Details:
        //             ---------------------
        //             Username: ${newUser.username}
        //             Email: ${newUser.email}
        //             Registration Date: ${new Date().toLocaleDateString()}
        //
        //             What to do next:
        //             ---------------------
        //             - Browse and rent vehicles such as cars, bikes, and e-scooters.
        //             - List your own vehicles to share them with others and earn income.
        //             - Customize your profile to make the most out of our services.
        //
        //             Need Assistance?
        //             ---------------------
        //             - Our support team is here to help! If you have any questions or need assistance, please contact us at ${process.env.SMTP_USER}.
        //             - Check out our FAQ section on our website for quick answers.
        //
        //             We look forward to seeing you on the road with Rideshare.
        //
        //             Best regards,
        //             The Rideshare Team
        //
        //             ---------------------
        //             This is an automated message, please do not reply to this email.`,
        //
        //     `<h1 style='color: cornflowerblue'> Dear ${newUser.username},</h1>
        //           <p>Welcome to Rideshare! We're thrilled to have you join our community. Your account has been successfully created, and you are now ready to explore all the features we offer.</p>
        //           <h2 style='color: deepskyblue'>Account Details:</h2>
        //           -------------------------------
        //           <p><strong style='color: cornflowerblue'>Username:</strong> ${newUser.username}</p>
        //           <p><strong style='color: cornflowerblue'>Email:</strong> ${newUser.email}</p>
        //           <p><strong style='color: cornflowerblue'>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
        //           <h2 style='color: deepskyblue'>What to do next:</h2>
        //           -------------------------------
        //           <p>- Browse and rent vehicles such as cars, bikes, and e-scooters.</p>
        //           <p>- List your own vehicles to share them with others and earn income.</p>
        //           <p>- Customize your profile to make the most out of our services.</p>
        //           <h2 style='color: deepskyblue'>Need Assistance?</h2>
        //           -------------------------------
        //           <p>- Our support team is here to help! If you have any questions or need assistance, please contact us at ${process.env.SMTP_USER}.</p>
        //           <p>- Check out our FAQ section on our website for quick answers.</p>
        //           <p>We look forward to seeing you on the road with Rideshare.</p>
        //           <p>Best regards,</p>
        //           <p style='color: deepskyblue'>The Rideshare Team</p>
        //           -------------------------------
        //           <p>This is an automated message, please do not reply to this email.</p>`
        // );


        res.status(201).json({ newUser });
    } catch (error) {
        console.log(error)
        res.status(400).json({ errors: error.errors });
    }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await DI.userRepository.findOne({ email: email },{
            populate: ['bookings', 'vehicles']
        });

        if (!user) {
            console.log("not found");
            return res.status(404).json({ errors: ['User not found'] });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ errors: ['Invalid password'] });
        }

        // @ts-ignore
        const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, SECRET_KEY, JWT_OPTIONS);

        res.json({ accessToken: token });
    } catch (error) {
        res.status(400).json({ errors: [error.message] });
    }
});

// Update user
router.put('/:id', upload.single('image'), async (req: Request, res: Response) => {
    try {
        const userId = req.params.id; // Ensure id is parsed as number

        const user = await DI.userRepository.findOne({id: userId}, { populate: ['bookings', 'vehicles'] });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        wrap(user).assign(req.body);
        if(req.file) {
            user.image = `/uploads/${req.file.filename}`;
        }
        await DI.em.flush();

        res.status(200).json(user);
    } catch (error) {
        console.error(error)
        res.status(400).json({ errors: [error.message] });
    }
});

// Get user profile with image retrieval
router.get('/:id', async (req: Request, res: Response) => {
    try {

        const user = await DI.userRepository.findOne({id: req.params.id},
        {populate:['vehicles', 'bookings', 'bookings.vehicle', 'vehicles.bookings']}
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

            res.json(user);
    } catch (error) {
        res.status(400).json({ errors: [error.message] });
    }
});

router.get('/:id/dashboard', async (req: Request, res: Response) => {
    try {

        const user = await DI.userRepository.findOne({id: req.params.id},
            {populate:['vehicles', 'vehicles.bookings', 'vehicles.bookings.renter']}
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(400).json({ errors: [error.message] });
    }
});

// Delete user
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.params.id; // Ensure id is parsed as number

        const user = await DI.userRepository.findOne({id: userId},
            {populate: ['vehicles']}
            );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        for(const vehilce of user.vehicles) {
            await DI.em.remove(vehilce).flush()
        }
        await DI.em.remove(user).flush();

        res.status(204).send();
    } catch (error) {
        res.status(400).json({ errors: [error.message] });
    }
});


export const UserController = router;
