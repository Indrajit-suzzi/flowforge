import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";
import Otp from "../models/otp.js";
import { sendWhatsAppOTP } from "../services/whatsapp.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const MAX_CONCURRENT_SESSIONS = parseInt(process.env.MAX_CONCURRENT_SESSIONS || '3', 10);

const signAppToken = async (user) => {
  const jti = crypto.randomUUID();
  const token = jwt.sign({
    id: user._id,
    tenantId: user.tenantId || user._id.toString(),
    iat: Math.floor(Date.now() / 1000),
    jti,
  }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  await User.updateOne(
    { _id: user._id },
    { $push: { activeSessions: { jti, createdAt: new Date() } } },
  );

  const updated = await User.findOneAndUpdate(
    { _id: user._id },
    {},
    { projection: { activeSessions: 1 } },
  );

  if (updated.activeSessions.length > MAX_CONCURRENT_SESSIONS) {
    const sorted = [...updated.activeSessions].sort((a, b) => b.createdAt - a.createdAt);
    const keep = sorted.slice(0, MAX_CONCURRENT_SESSIONS);
    await User.updateOne(
      { _id: user._id },
      { $set: { activeSessions: keep } },
    );
  }

  return token;
};

const toSafeUser = (user) => {
  const { password: _password, ...safeUser } = user.toObject();
  return safeUser;
};

const createRandomPasswordHash = async () => bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

const findOrCreateOAuthUser = async ({ email, username, providerField, providerId }) => {
  let user = await User.findOne({ email });

  if (user) {
    if (!user.isActive) {
      const err = new Error('Account is disabled');
      err.statusCode = 403;
      throw err;
    }

    user[providerField] = providerId;
    if (!user.tenantId) user.tenantId = user._id.toString();
    if (username && user.username !== username) {
      user.username = username;
    }
    await user.save();
    return user;
  }

  user = await User.create({
    [providerField]: providerId,
    username,
    email,
    password: await createRandomPasswordHash(),
    role: 'member',
  });
  user.tenantId = user._id.toString();
  await user.save();

  return user;
};

const getFrontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google auth is not configured' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({ message: 'Google account email is not verified' });
    }

    const user = await findOrCreateOAuthUser({
      email: payload.email,
      username: payload.name || payload.email.split('@')[0],
      providerField: 'googleId',
      providerId: payload.sub,
    });

    res.json({ token: await signAppToken(user), user: toSafeUser(user) });
  } catch (err) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(err.statusCode || 401).json({ message: isProduction ? 'Google sign-in failed' : err.message });
  }
};

export const githubStart = async (_req, res) => {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return res.status(500).json({ message: 'GitHub auth is not configured' });
  }

  const state = jwt.sign(
    { nonce: crypto.randomUUID() },
    process.env.JWT_SECRET,
    { expiresIn: '10m' },
  );
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: `${process.env.API_PUBLIC_URL || 'http://localhost:3000'}/api/v1/auth/github/callback`,
    scope: 'read:user user:email',
    state,
  });

  return res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
};

export const githubCallback = async (req, res) => {
  const frontendUrl = getFrontendUrl();

  try {
    const { code, state } = req.query;
    if (!code || !state) {
      throw new Error('Missing GitHub OAuth code or state');
    }

    jwt.verify(state, process.env.JWT_SECRET);

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.API_PUBLIC_URL || 'http://localhost:3000'}/api/v1/auth/github/callback`,
      }),
    });
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error_description || 'GitHub token exchange failed');
    }

    const githubHeaders = {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${tokenData.access_token}`,
      'User-Agent': 'FlowForge',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    const [profileResponse, emailsResponse] = await Promise.all([
      fetch('https://api.github.com/user', { headers: githubHeaders }),
      fetch('https://api.github.com/user/emails', { headers: githubHeaders }),
    ]);
    const profile = await profileResponse.json();
    const emails = await emailsResponse.json();

    if (!profileResponse.ok || !emailsResponse.ok) {
      throw new Error('Could not load GitHub profile');
    }

    const primaryEmail = emails.find(email => email.primary && email.verified) || emails.find(email => email.verified);
    if (!primaryEmail?.email) {
      throw new Error('GitHub account needs a verified email');
    }

    const user = await findOrCreateOAuthUser({
      email: primaryEmail.email,
      username: profile.name || profile.login || primaryEmail.email.split('@')[0],
      providerField: 'githubId',
      providerId: String(profile.id),
    });
    const token = await signAppToken(user);
    const params = new URLSearchParams({ token });

    return res.redirect(`${frontendUrl}/auth/callback#${params.toString()}`);
  } catch (err) {
    const params = new URLSearchParams({ error: err.message || 'GitHub sign-in failed' });
    return res.redirect(`${frontendUrl}/sign-in?${params.toString()}`);
  }
};

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;
const AUTHKEY_EXPIRY = '15m';

export const requestOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const recentOtp = await Otp.findOne({
      phoneNumber,
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) },
      verified: false,
    });

    if (recentOtp) {
      return res.status(429).json({ error: 'Please wait before requesting a new OTP' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    await Otp.create({
      phoneNumber,
      otpHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    });

    await sendWhatsAppOTP(phoneNumber, otp);

    res.json({
      message: 'OTP sent successfully',
      expiresIn: OTP_EXPIRY_MINUTES * 60,
    });
  } catch (err) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(err.statusCode || 500).json({
      error: isProduction ? 'Failed to send OTP' : err.message,
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    const otpRecord = await Otp.findOne({
      phoneNumber,
      verified: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ error: 'No valid OTP found. Please request a new one.' });
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many attempts. Please request a new OTP.' });
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    const authkey = jwt.sign(
      {
        purpose: 'phone-verification',
        phoneNumber,
        verifiedAt: new Date().toISOString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: AUTHKEY_EXPIRY },
    );

    res.json({ authkey, expiresIn: 15 * 60 });
  } catch (err) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({
      error: isProduction ? 'Verification failed' : err.message,
    });
  }
};

export const phoneLogin = async (req, res) => {
  try {
    const { authkey } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(authkey, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired authkey' });
    }

    if (decoded.purpose !== 'phone-verification' || !decoded.phoneNumber) {
      return res.status(403).json({ error: 'Invalid authkey purpose' });
    }

    const { phoneNumber } = decoded;

    let user = await User.findOne({ phoneNumber });

    if (user) {
      if (!user.isActive) {
        return res.status(403).json({ error: 'Account is disabled' });
      }
    } else {
      const username = `user_${phoneNumber.replace(/[^0-9]/g, '')}`;
      const email = `${username}@phone.flowforge.app`;

      user = await User.create({
        phoneNumber,
        username,
        email,
        password: await createRandomPasswordHash(),
        role: 'member',
        profileComplete: false,
      });
      user.tenantId = user._id.toString();
      await user.save();
    }

    const token = await signAppToken(user);

    res.json({ token, user: toSafeUser(user) });
  } catch (err) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({
      error: isProduction ? 'Phone sign-in failed' : err.message,
    });
  }
};

export const completePhoneProfile = async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    const existingEmail = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existingEmail) {
      return res.status(409).json({ error: 'Email is already in use' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, email, profileComplete: true },
      { new: true, select: { password: 0 } },
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({
      error: isProduction ? 'Failed to complete profile' : err.message,
    });
  }
};
