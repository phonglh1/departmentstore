const Errorhandler = require("../utils/errorHandler");
const catchAsyncErrors =require('../middlewares/catchAsyncErrors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


//Process stripe paynemt http://localhost:4000/api/v1/payment/process
const processPayment = catchAsyncErrors( async(req, res, next) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'usd',

        metadata: {integration_check: 'accept_a_payment'}
    })

    res.status(200).json({
        success: true,
        client_secret: paymentIntent.client_secret
    })
}) 

//Sent stripe API Key http://localhost:4000/api/v1/stripeapi
const sendStripeApi = catchAsyncErrors( async(req, res, next) => {
 
    res.status(200).json({
        stripeApiKey: process.env.STRIPE_API_KEY
    })
}) 



module.exports = { 
    processPayment,
    sendStripeApi
}