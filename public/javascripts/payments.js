/**
 * payments.js
 * Stripe Registration. Created by Fauzaan
 *
 * This modern JavaScript file handles the register process using Stripe.
 */

(async () => {
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
  const stripe = Stripe(config.stripePublishableKey);
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

  // Create a Card Element and pass some custom styles to it.
  const card = elements.create('card', { style, hidePostalCode: true });
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

  async function createPaymentIntent(body) {
    try {
      const confirmPayment = await fetch('/confirm_payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await confirmPayment.json();

      if (confirmPayment.status === 200) {
        // Return json
        return data;
      }

      console.log('Register Error', confirmPayment);
      return window.postMessage('registerError|close');
    } catch (error) {
      console.log('error', error);
      // Return error message
      return window.postMessage('registerError|close');
    }
  }

  /**
   * Handle Server response
   */
  async function handleServerResponse(response) {
    if (response.error) {
      console.log('Response Error:', response.error);
      window.postMessage('registerError|close');
    } else if (response.requires_action) {
      // Use Stripe.js to handle required card action
      const result = await stripe.handleCardAction(response.payment_intent_client_secret);

      if (result.error) {
        console.log('Response requires_action:', result.error);
        // Show error in payment form
        return window.postMessage('registerError|close');
      }

      // The card action has been handled
      // The PaymentIntent can be confirmed again on the server || Pass memeber ID
      const confirmPayment = await createPaymentIntent({ payment_intent_id: result.paymentIntent.id, memberId: '220292' });

      return handleServerResponse(confirmPayment);
    }

    // Show success message
    console.log('Success');
    return window.postMessage('registerComplete', '*');
  }

  /**
   * Handle the form submission.
   *
   * This uses Stripe.js to confirm the PaymentIntent using payment details collected
   * with Elements.
   */
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Disable the Pay button to prevent multiple click events.
    submitButton.disabled = true;
    submitButton.textContent = 'Processing…';

    // Create payment
    const response = await stripe.createPaymentMethod('card', card);

    // Throw error based on response
    if (response.error) {
      submitButton.disabled = false;
      submitButton.textContent = 'Add Card';
    }

    // Otherwise send paymentMethod.id to your server (see Step 2) || Pass memeber ID
    const confirmPayment = await createPaymentIntent({ payment_method_id: response.paymentMethod.id, memberId: '220292' });

    // Handle response
    return handleServerResponse(confirmPayment);
  });

  // After-render effetcs
  const mainElement = document.getElementById('main');
  mainElement.classList.add('checkout');
  document.getElementById('main').classList.remove('loading');
})();
