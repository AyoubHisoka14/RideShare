import dotenv from 'dotenv';


dotenv.config();
import * as process from "process";
import bcrypt from 'bcrypt';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

import { DI } from '../index';

const BCRYPT_SALT = 10;
//!! This should load from env - not hardcoded!
const JWT_SECRET = process.env.SECRET;
const JWT_OPTIONS: SignOptions = {
  expiresIn: process.env.EXPIRES_IN ? parseInt(process.env.EXPIRES_IN, 10) : undefined, // in seconds
  issuer: process.env.ISSUER,
};

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

// password functionality
const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_SALT);
const comparePasswordWithHash = async (password: string, hash: string) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
};

// jwt functionality
type JwtUserData = {
  email: string;
  username: string;
  id: string;
};
export type JWTToken = JwtUserData & JwtPayload;

const generateToken = (payload: JwtUserData) => {
  return jwt.sign(payload, JWT_SECRET, JWT_OPTIONS);
};
const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as JWTToken;
};

// middleware
const prepareAuthentication = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.get('Authorization');
  if (authHeader) {
    try {
      const token = verifyToken(authHeader);
      req.user = await DI.userRepository.findOne(token.id);
      req.token = token;
    } catch (e) {
      console.error(e);
    }
  } else {
    req.user = null;
    req.token = null;
  }
  next();
};

const verifyAccess: RequestHandler = (req, res, next) => {
  const token = req.headers['authorization'];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ errors: [`You don't have access`] });
    next();
  });


};

// exports
export const Auth = {
  comparePasswordWithHash,
  generateToken,
  hashPassword,
  prepareAuthentication,
  verifyAccess,
  verifyToken,
};
