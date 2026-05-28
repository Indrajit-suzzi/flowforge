import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signAppToken = (user) => jwt.sign({
  id: user._id,
  role: user.role,
  iat: Math.floor(Date.now() / 1000),
  jti: crypto.randomUUID(),
}, process.env.JWT_SECRET, {
  expiresIn: "1h",
});

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

    res.json({ token: signAppToken(user), user: toSafeUser(user) });
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
    const token = signAppToken(user);
    const params = new URLSearchParams({ token });

    return res.redirect(`${frontendUrl}/auth/callback#${params.toString()}`);
  } catch (err) {
    const params = new URLSearchParams({ error: err.message || 'GitHub sign-in failed' });
    return res.redirect(`${frontendUrl}/sign-in?${params.toString()}`);
  }
};
