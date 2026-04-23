const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { subscriptions: { where: { status: 'active' }, orderBy: { start_date: 'desc' }, take: 1 } },
    });

    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user;
    req.plan = user.subscriptions[0]?.plan || 'free';
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const requireVerified = (req, res, next) => {
  if (!req.user?.verified) {
    return res.status(403).json({ error: 'Please verify your email first' });
  }
  next();
};

module.exports = { authenticate, requireAdmin, requireVerified };
