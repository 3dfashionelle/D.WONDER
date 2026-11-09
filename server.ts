import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy-load Stripe client
let stripeClient: Stripe | null = null;
const getStripe = () => {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      // In development/preview, we can return null to allow simulation
      return null;
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Real Stripe Payment Intent Route
  app.post('/api/create-payment-intent', async (req, res) => {
    try {
      const { amount, service } = req.body;
      const stripe = getStripe();
      
      const centAmount = Math.round((amount || 2.99) * 100);

      if (!stripe) {
        // Fallback to simulation if no API key is provided
        console.warn('STRIPE_SECRET_KEY missing. Running in simulation mode.');
        return res.json({
          success: true,
          mode: 'simulation',
          clientSecret: 'simulated_secret_' + Math.random().toString(36).substring(7),
          amount: amount || 2.99
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: centAmount,
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
        metadata: { service: service || 'dwonder_magazine_export' }
      });

      res.json({
        success: true,
        mode: 'live',
        clientSecret: paymentIntent.client_secret,
        amount: amount || 2.99
      });
    } catch (error) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  });

  app.post('/api/verify-payment', async (req, res) => {
    const { paymentIntentId } = req.body;
    const stripe = getStripe();

    if (!stripe) {
      return res.json({ status: 'succeeded', mode: 'simulation' });
    }

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      res.json({ status: paymentIntent.status });
    } catch (error) {
      res.status(500).json({ error: 'Verification failed' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
