import express, { Response, Router } from 'express';
import { ParsedQs } from 'qs';

require('dotenv')
    .config();
import axios from 'axios'
import {DI} from "../index";
import process from "process";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL;


async function generateAccessToken() {
    // @ts-ignore
    const response = await axios({
        url: `${PAYPAL_BASE_URL}/v1/oauth2/token`,
        method: 'post',
        data: 'grant_type=client_credentials',
        auth: {
            username: PAYPAL_CLIENT_ID,
            password: PAYPAL_SECRET,
        }
    });

    return response.data.access_token;
}

interface PayPalOrderResponse {
    id: string;
    approvalLink: string;
}

// @ts-ignore
const createOrder = async (price, ownerPaypal): Promise<PayPalOrderResponse> => {
    const accessToken = await generateAccessToken();
    try {
        const response = await axios({
            url: `${PAYPAL_BASE_URL}/v2/checkout/orders`,
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            },
            data: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        items: [
                            {
                                name: 'Booking',
                                description: 'Booking',
                                quantity: 1,
                                unit_amount: {
                                    currency_code: 'EUR',
                                    value: price
                                }
                            }
                        ],

                        amount: {
                            currency_code: 'EUR',
                            value: price,
                            breakdown: {
                                item_total: {
                                    currency_code: 'EUR',
                                    value: price
                                }
                            }
                        },

                        payee: {
                            email_address: ownerPaypal,
                        }
                    }
                ],

                application_context: {
                    return_url: 'http://localhost:3400/paypal/complete-order',
                    cancel_url: 'http://localhost:3400/paypal/cancel-order',
                    shipping_preference: 'NO_SHIPPING',
                    user_action: 'PAY_NOW',
                    brand_name: 'RideShare'
                }
            })
        });

        const id = response.data.id;
        const approvalLink = response.data.links.find((link: { rel: string }) => link.rel === 'approve').href;

        return { id, approvalLink };
    } catch (error) {
        console.error(error);
    }

}

async function capturePayment(orderId: string | ParsedQs | string[] | ParsedQs[] | undefined) {
    const accessToken = await generateAccessToken();

    const response = await axios({
        url: `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        }
    });

    return response.data;
}
const router = express.Router();

router.post('/pay/:bookingId', async (req, res) => {
    try {
        const booking = await DI.bookingRepository.findOne({ id: req.params.bookingId },
            {populate: ['vehicle.owner']}
            );
        const { id, approvalLink } = await createOrder(booking?.totalPrice, booking?.vehicle?.owner.paypalEmail);
        orderStatus[id] = req.params.bookingId; //We assign the order id to the booking id
        return res.send({ id, url: approvalLink });
    } catch (error) {
        return res.status(500)
            .json({ error: 'Error creating PayPal order' });
    }
});

let orderStatus: { [key: string]: string } = {};

router.get('/complete-order', async (req, res) => {
    try {
        const token = req.query.token as string;
        await capturePayment(token);
        const id = orderStatus[token]; //we retrieve the booking id from the order id
        const booking = await DI.bookingRepository.findOne({ id: id });
        // @ts-ignore
        booking?.isPaid = true;
        await DI.em.flush();

        return res.redirect('http://localhost:5173/payment-success')
    } catch (error) {
        return res.send('Error capturing PayPal payment: ' + error);
    }
});

router.get('/cancel-order', async (req, res) => {
    const token = req.query.token as string;

    return res.redirect('http://localhost:5173/payment-failed')
});




export const PaypalController = router;



