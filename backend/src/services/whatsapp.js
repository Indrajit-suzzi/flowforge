import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import logger from '../utils/logger.js';
import qrcode from 'qrcode';

let client = null;
let clientReady = false;
let currentQR = null;
let initPromise = null;

const getClient = async () => {
  if (client && clientReady) return client;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (client && clientReady) return client;

    currentQR = null;
    client = new Client({
      authStrategy: new LocalAuth({ dataPath: process.env.WA_SESSION_PATH || './wa-sessions' }),
      puppeteer: {
        headless: true,
        executablePath: '/usr/bin/google-chrome-stable',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    client.on('qr', async (qr) => {
      currentQR = qr;
      const url = await qrcode.toDataURL(qr, { width: 300, margin: 2 });
      currentQR = { raw: qr, url };
      logger.info('WhatsApp QR code received');
    });

    client.on('ready', () => {
      clientReady = true;
      currentQR = null;
      logger.info('WhatsApp client ready');
    });

    client.on('disconnected', (reason) => {
      clientReady = false;
      logger.warn({ reason }, 'WhatsApp client disconnected');
    });

    client.initialize();

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (!clientReady) logger.warn('WhatsApp client not ready yet — continuing without it');
        resolve();
      }, 30000);

      client.on('ready', () => {
        clearTimeout(timeout);
        resolve();
      });

      client.on('auth_failure', (msg) => {
        clearTimeout(timeout);
        reject(new Error(`WhatsApp auth failure: ${msg}`));
      });
    });

    return client;
  })();

  return initPromise;
};

export const getQR = async () => {
  await getClient();
  if (clientReady) return { status: 'connected' };
  if (currentQR) return { status: 'pending', ...currentQR };
  return { status: 'initializing' };
};

export const getStatus = async () => {
  await getClient();
  return {
    ready: clientReady,
    hasQR: !!currentQR,
  };
};

export const disconnect = async () => {
  if (client) {
    client.destroy();
    client = null;
    clientReady = false;
    currentQR = null;
    initPromise = null;
  }
};

const CHAT_ID_REGEX = /^\d{5,15}@c\.us$/;

export const sendWhatsAppOTP = async (phoneNumber, otp) => {
  const wa = await getClient();

  if (!clientReady) {
    logger.warn(`WhatsApp client not ready. Simulating OTP send to ${phoneNumber}`);
    return { simulated: true };
  }

  try {
    const chatId = phoneNumber.replace(/[^0-9]/g, '') + '@c.us';

    if (!CHAT_ID_REGEX.test(chatId)) {
      throw new Error('Invalid phone number format');
    }

    const message = await wa.sendMessage(
      chatId,
      `Your FlowForge verification code is: *${otp}*.\nValid for 5 minutes. Do not share this code.`,
    );

    logger.info({ messageId: message.id?.id }, `WhatsApp OTP sent to ${phoneNumber}`);
    return { sent: true };
  } catch (err) {
    logger.error({ err }, `Failed to send WhatsApp OTP to ${phoneNumber}`);
    throw new Error('Failed to send OTP. Please try again later.');
  }
};
