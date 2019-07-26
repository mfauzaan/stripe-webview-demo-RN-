/**
 * routes.js
 * Stripe Payments Demo. Created by Romain Huet (@romainhuet)
 * and Thorsten Schaeff (@thorwebdev).
 *
 * This file defines all the endpoints for this demo app. The two most interesting
 * endpoints for a Stripe integration are marked as such at the beginning of the file.
 * It's all you need in your app to accept all payments in your app.
 */

'use strict';

const config = require('./config');
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(config.stripe.secretKey);
stripe.setApiVersion(config.stripe.apiVersion);

/**
 * Stripe integration to accept all types of payments with 3 POST endpoints.
 *
 * 1. POST endpoint to create a PaymentIntent.
 * 2. For payments using Elements, Payment Request, Apple Pay, Google Pay, Microsoft Pay
 * the PaymentIntent is confirmed automatically with Stripe.js on the client-side.
 * 3. POST endpoint to be set as a webhook endpoint on your Stripe account.
 * It confirms the PaymentIntent as soon as a non-card payment source becomes chargeable.
 */

 // Create the PaymentIntent on the backend.
router.get('/', async (req, res, next) => {
  if (req.query.success == 'true') {
    return res.send({ success: true })
  }  else {
    return res.send({ success: false })
  }
});

router.get('/paymentIntent', async (req, res, next) => {
  return res.render('index');
});

router.post('/confirm_payment', async (req, res, next) => {
  try {
    let intent;
    if (req.body.payment_method_id) {
      // Create the PaymentIntent
      intent = await stripe.paymentIntents.create({
        payment_method: req.body.payment_method_id,
        amount: 200,
        currency: 'myr',
        confirmation_method: 'manual',
        confirm: true,
        setup_future_usage: 'off_session'
      });

    } else if (req.body.payment_intent_id) {
      intent = await stripe.paymentIntents.confirm(
        req.body.payment_intent_id
      );
    }
    // Send the res to the client
    res.send(await generate_payment_response(intent));
  } catch (e) {
    console.log(e);
    // Display error on client
    return response.send({ error: e.message });
  }
});

const generate_payment_response = async (intent) => {
  // Note that if your API version is before 2019-02-11, 'requires_action'
  // appears as 'requires_source_action'.
  
  if (
    intent.status === 'requires_action' &&
    intent.next_action.type === 'use_stripe_sdk'
  ) {
    // Tell the client to handle the action
    return {
      requires_action: true,
      payment_intent_client_secret: intent.client_secret
    };
  } else if (intent.status === 'succeeded') {
    // The payment didn’t need any additional actions and completed!
    // Handle post-payment fulfillment
    console.log('Attach payment');

    const customer = await stripe.customers.create({
      payment_method: intent.payment_method,
      name: 'Mohamed Fauzaan',
      email: 'mfauzaan@icloud.com',
      phone: `960 9557555`,
      metadata: {
        memberId: 123213,
        birthday: 19970801,
      },
    });

    console.log(customer);
    
    return {
      success: true
    };
  } else {
    // Invalid status
    return {
      error: 'Invalid PaymentIntent status'
    }
  }
};

/**
 * Routes exposing the config as well as the ability to retrieve products.
 */

// Expose the Stripe publishable key and other pieces of config via an endpoint.
router.get('/config', (req, res) => {
  res.json({
    stripePublishableKey: config.stripe.publishableKey,
    stripeCountry: config.stripe.country,
  });
});

module.exports = router;
