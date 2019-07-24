/**
 * payments.js
 * Stripe Payments Demo. Created by Romain Huet (@romainhuet)
 * and Thorsten Schaeff (@thorwebdev).
 *
 * This modern JavaScript file handles the checkout process using Stripe.
 *
 * 1. It shows how to accept card payments with the `card` Element, and
 * the `paymentRequestButton` Element for Payment Request and Apple Pay.
 * 2. It shows how to use the Stripe Sources API to accept non-card payments,
 * such as iDEAL, SOFORT, SEPA Direct Debit, and more.
 */

(async () => {
  'use strict';

  let config = '';
  // Create references to the main form and its submit button.
  const form = document.getElementById('payment-form');
  const submitButton = form.querySelector('button[type=submit]');

  // Retrieve the configuration for the store.
  try {
    const response = await fetch('/config');
    config = await response.json();
  } catch (err) {
    return {error: err.message};
  }

  /**
   * Setup Stripe Elements.
   */

  // Create a Stripe client.
  const stripe = Stripe(config.stripePublishableKey);

  // Create an instance of Elements.
  const elements = stripe.elements();

  // Prepare the styles for Elements.
  const style = {
    base: {
      iconColor: '#666ee8',
      color: '#31325f',
      fontWeight: 400,
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '15px',
      '::placeholder': {
        color: '#aab7c4',
      },
      ':-webkit-autofill': {
        color: '#666ee8',
      },
    },
  };

  /**
   * Implement a Stripe Card Element that matches the look-and-feel of the app.
   *
   * This makes it easy to collect debit and credit card payments information.
   */

  // Create a Card Element and pass some custom styles to it.
  const card = elements.create('card', { style, hidePostalCode: true });
  // Mount the Card Element on the page.
  card.mount('#card-element');

  // Monitor change events on the Card Element to display any errors.
  card.on('change', ({error}) => {
    const cardErrors = document.getElementById('card-errors');
    if (error) {
      cardErrors.textContent = error.message;
      cardErrors.classList.add('visible');
    } else {
      cardErrors.classList.remove('visible');
    }
    // Re-enable the Pay button.
    submitButton.disabled = false;
  });

  /**
   * Handle the form submission.
   *
   * This uses Stripe.js to confirm the PaymentIntent using payment details collected
   * with Elements.
   *
   * Please note this form is not submitted when the user chooses the "Pay" button
   * or Apple Pay, Google Pay, and Microsoft Pay since they provide name and
   * shipping information directly.
   */

  // Submit handler for our payment form.
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const url = new URL(window.location.href);

    // Disable the Pay button to prevent multiple click events.
    submitButton.disabled = true;
    submitButton.textContent = 'Processing…';

    stripe.createPaymentMethod('card', card).then(function(result) {
      if (result.error) {
        console.log('error', result.error);
        // Show error in payment form
      } else {
        // Otherwise send paymentMethod.id to your server (see Step 2)
        fetch('/confirm_payment', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({payment_method_id: result.paymentMethod.id}),
        }).then(function(result) {
          // Handle server response (see Step 3)
          result.json().then(function(json) {
            handleServerResponse(json);
          });
        });
      }
    });
  });

  function handleServerResponse(response) {
    if (response.error) {
      // Show error from server on payment form
    } else if (response.requires_action) {
      // Use Stripe.js to handle required card action
      stripe
        .handleCardAction(response.payment_intent_client_secret)
        .then(function(result) {
          if (result.error) {
            // Show error in payment form
          } else {
            // The card action has been handled
            // The PaymentIntent can be confirmed again on the server
            fetch('/confirm_payment', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                payment_intent_id: result.paymentIntent.id,
              }),
            })
              .then(function(confirmResult) {
                return confirmResult.json();
              })
              .then(handleServerResponse);
          }
        });
    } else {
      // Show success message
      window.location.replace("/");
    }
  }

  const mainElement = document.getElementById('main');
  mainElement.classList.add('checkout');

  document.getElementById('main').classList.remove('loading');
})();
