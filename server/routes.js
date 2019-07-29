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
 * Stripe Register payment flow.
 *
 * 1. Render view after authentication.
 * 2. On form submuit, create payment method from client & Send in to confirm_payment
 * 3. From client side handleServerResponse function will handle if 3d Payment is required
 * 4. call back again to confirm_payment with 3d authenticated Payment Intent,
 * 5. Store save card details upon intent.success
 */

// Render index page
router.get('/', async (req, res, next) => {
  // Pass member ID to view to authenticate
  return res.render('index');
});

// Callback to confirm page
router.post('/confirm_payment', async (req, res, next) => {
  try {
    const { payment_method_id, payment_intent_id } = req.body;

    let intent;

    // Handle 1st call from view
    if (payment_method_id) {
      // Create the PaymentIntent
      intent = await stripe.paymentIntents.create({
        payment_method: payment_method_id,
        amount: 200,
        currency: 'MYR',
        confirmation_method: 'manual',
        confirm: true,
        setup_future_usage: 'off_session',
      });
    } else if (payment_intent_id) {
      intent = await stripe.paymentIntents.confirm(
        payment_intent_id,
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

 // Redirect url
router.get('/paymentIntent', async (req, res, next) => {
  if (req.query.success == 'true') {
    return res.send({ success: true })
  }  else {
    return res.send({ success: false })
  }
});

const generate_payment_response = async (intent) => {
  // Note that if your API version is before 2019-02-11, 'requires_action'
  // appears as 'requires_source_action'.
  if (
    intent.status === 'requires_source_action' &&
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
    // Create customer
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

    // Save the card info in a database for later.

    // The payment didn’t need any additional actions and completed!
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
