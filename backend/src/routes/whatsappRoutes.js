import express from 'express';
import { getQR, getStatus, disconnect } from '../services/whatsapp.js';

const router = express.Router();

router.get('/qr', async (req, res) => {
  try {
    const result = await getQR();
    if (result.status === 'connected') {
      return res.json({ status: 'connected', message: 'WhatsApp is already linked' });
    }
    if (result.status === 'pending') {
      return res.json({
        status: 'pending',
        qr: result.url,
        message: 'Scan the QR code with WhatsApp mobile app',
      });
    }
    res.json({ status: 'initializing', message: 'WhatsApp client is starting...' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/status', async (req, res) => {
  try {
    const status = await getStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/disconnect', async (req, res) => {
  try {
    await disconnect();
    res.json({ message: 'WhatsApp disconnected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
export default router;
