import dotenv from 'dotenv';


dotenv.config();
import { createTransport, SentMessageInfo } from 'nodemailer';
import * as process from "process";

const mailTransporter = createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
  secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  debug: process.env.NODE_ENV === 'development',
  logger: true,
});


const sendMail = async (
    to: string,
    subject: string,
    text: string,
    html: string,
): Promise<SentMessageInfo> => {
  const info = await mailTransporter.sendMail({
    from: process.env.SMTP_SENDER_ADDRESS, // adress of the sender
    to, // list of receivers
    subject: `Rideshare - ${subject}`,
    text,
    html,
  });

  console.log(`Message sent: ${info.messageId}`);

  return info;
};
export const sendMails = {sendMail};
