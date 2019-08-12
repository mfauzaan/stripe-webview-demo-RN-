# Stripe React-native paymentIntent Demo 

This demo features implimentation includes Card saving in react-native app using paymentIntent method.
At the time Tipsi does not support PaymentIntent, this is the best alternative. This implimentation can be used in websites as well. Just replace POST Messages to page redirect. 

**Note: Please enable webkit for best performence in react-native webview**

️⚠️ [️PaymentIntents](https://stripe.com/docs/payments/payment-intents) is now the recommended integration path for 3D Secure authentication. It lets you benefit from [Dynamic 3D Secure](https://stripe.com/docs/payments/dynamic-3ds) and helps you prepare for [Strong Customer Authentication](https://stripe.com/guides/strong-customer-authentication) regulation in Europe. If you integrate 3D Secure on PaymentIntents today, we’ll seamlessly transition you to [3D Secure 2](https://stripe.com/guides/3d-secure-2) once supported—without requiring any changes to your integration. As a reference you can find the previous integration that uses the Sources API for 3D Secure on [this branch](https://github.com/stripe/stripe-payments-demo/tree/legacy-cards-3d-secure).

## Overview

This demo provides an all-in-one example for integrating with Stripe on the web:

<!-- prettier-ignore -->
|     | Features
:---: | :---
✨ | **Beautiful UI components for card payments**. This demo uses pre-built Stripe components customized to fit the app design, including the [Card Element](https://stripe.com/docs/elements) which provides real-time validation, formatting, and autofill.
💳 | **Card payments with Payment Request, ** The app offers frictionless card payment experiences with a single integration using the new [Payment Request Button Element](https://stripe.com/docs/elements/payment-request-button).
🌍 | **Payment methods for Europe and Asia.** A dozen redirect-based payment methods are supported through the [Sources API](https://stripe.com/docs/sources), from iDEAL to WeChat Pay.
🎩 | **Automatic payment methods suggestion.** Picking a country will automatically show relevant payment methods. For example, selecting  “Germany” will suggest SOFORT, Giropay, and SEPA Debit.
🔐 | **Dynamic 3D Secure for Visa and Mastercard.** The app automatically handles the correct flow to complete card payments with [3D Secure](https://stripe.com/docs/payments/dynamic-3ds), whether it’s required by the card or encoded in one of your [3D Secure Radar rules](https://dashboard.stripe.com/radar/rules).
📱 | **Responsive design**. The checkout experience works on all screen sizes. Apple Pay works on Safari for iPhone and iPad if the Wallet is enabled, and Payment Request works on Chrome for Android.

## Getting Started with Node

### Requirements

You’ll need the following:

- [Node.js](http://nodejs.org) >= 10.x.
- Modern browser that supports ES6 (Chrome to see the Payment Request, and Safari to see Apple Pay).
- Stripe account to accept payments ([sign up](https://dashboard.stripe.com/register) for free).

In your Stripe Dashboard, you can [enable the payment methods](https://dashboard.stripe.com/payments/settings) you’d like to test with one click.

Some payment methods require additional step to verify the payment, in that case verification method is handled and redirect response to the API.

### Running the Node Server

Copy the environment variables file from the root of the repository:

    cp .env.example .env

Update `.env` with your own [Stripe API keys](https://dashboard.stripe.com/account/apikeys) and any other configuration details. These environment variables are loaded and used in [`server/node/config.js`](/server/node/config.js), where you can review and edit other options such as the app currency and your Stripe account country.

Install dependencies using npm:

    npm install

This demo uses the Stripe API as a datastore for products and SKUs, but you can always choose to use your own datastore instead. When starting the app for the first time, the initial loading can take a couple of seconds as it will automatically set up the products and SKUs within Stripe.

Run the app:

    npm run start

### Credits
[stripe-payments-demo](https://github.com/stripe/stripe-payments-demo)
