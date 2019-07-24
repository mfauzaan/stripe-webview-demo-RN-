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
const {products} = require('./inventory');
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(config.stripe.secretKey);
stripe.setApiVersion(config.stripe.apiVersion);

// Render the main app HTML.
/* router.get('/', (req, res) => {
  res.render('index.html');
}); */

/**
 * Stripe integration to accept all types of payments with 3 POST endpoints.
 *
 * 1. POST endpoint to create a PaymentIntent.
 * 2. For payments using Elements, Payment Request, Apple Pay, Google Pay, Microsoft Pay
 * the PaymentIntent is confirmed automatically with Stripe.js on the client-side.
 * 3. POST endpoint to be set as a webhook endpoint on your Stripe account.
 * It confirms the PaymentIntent as soon as a non-card payment source becomes chargeable.
 */

// Calculate total payment amount based on items in basket.
const calculatePaymentAmount = async items => {
  const productList = await products.list();
  // Look up sku for the item so we can get the current price.
  const skus = productList.data.reduce(
    (a, product) => [...a, ...product.skus.data],
    []
  );
  const total = items.reduce((a, item) => {
    const sku = skus.filter(sku => sku.id === item.parent)[0];
    return a + sku.price * item.quantity;
  }, 0);
  return total;
};

// Create the PaymentIntent on the backend.
router.get('/', async (req, res, next) => {
  return res.send({ success: true })
});

router.get('/paymentIntent', async (req, res, next) => {
  return res.render('index');
});

router.post('/confirm_payment', async (request, response, next) => {
  try {
    let intent;
    if (request.body.payment_method_id) {
      // Attach customer
      const customer = await stripe.customers.create({
        name: 'Mohamed Fauzaan',
        email: 'mfauzaan@icloud.com',
        phone: `960 9557555`,
        metadata: {
          memberId: 123213,
          birthday: 19970801,
        },
      });

      // Create the PaymentIntent
      intent = await stripe.paymentIntents.create({
        payment_method: request.body.payment_method_id,
        amount: 200,
        currency: 'myr',
        confirmation_method: 'manual',
        confirm: true,
        save_payment_method: true,
        customer: customer.id
      });
    } else if (request.body.payment_intent_id) {
      intent = await stripe.paymentIntents.confirm(
        request.body.payment_intent_id
      );
    }
    // Send the response to the client
    response.send(generate_payment_response(intent));
  } catch (e) {
    console.log(e);
    // Display error on client
    return response.send({ error: e.message });
  }
});

const generate_payment_response = (intent) => {
  // Note that if your API version is before 2019-02-11, 'requires_action'
  // appears as 'requires_source_action'.
  console.log(intent.status);
  
  if (
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
    country: config.country,
    currency: config.currency,
    paymentMethods: config.paymentMethods,
    shippingOptions: config.shippingOptions,
  });
});

module.exports = router;
