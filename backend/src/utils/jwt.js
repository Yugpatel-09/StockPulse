const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

const saveRefreshToken = async (userId, token, deviceInfo = '') => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({
    data: { user_id: userId, refresh_token: token, device_info: deviceInfo, expires_at: expiresAt },
  });
};

const revokeRefreshToken = async (token) => {
  await prisma.session.deleteMany({ where: { refresh_token: token } });
};

const revokeAllUserTokens = async (userId) => {
  await prisma.session.deleteMany({ where: { user_id: userId } });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
};
