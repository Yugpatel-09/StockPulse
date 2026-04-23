const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');

const prisma = new PrismaClient();

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

const logAction = async (adminId, action, target_type = null, target_id = null) => {
  await prisma.adminLog.create({ data: { admin_id: adminId, action, target_type, target_id } });
};

// GET /api/admin/dashboard-stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const [totalUsers, totalRevenue, activeSubscribers, todayArticles, recentPayments, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.payment.aggregate({ where: { status: 'success' }, _sum: { amount: true } }),
      prisma.subscription.count({ where: { status: 'active', plan: { not: 'free' } } }),
      prisma.newsArticle.count({ where: { fetched_at: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
      prisma.payment.findMany({ where: { status: 'success' }, orderBy: { created_at: 'desc' }, take: 10, include: { user: { select: { full_name: true, email: true } } } }),
      prisma.user.findMany({ orderBy: { created_at: 'desc' }, take: 10, select: { id: true, full_name: true, email: true, country: true, created_at: true } }),
    ]);

    // Signups per day (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const signupsByDay = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Revenue per month
    const revenueByMonth = await prisma.$queryRaw`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month, SUM(amount) as revenue
      FROM payments
      WHERE status = 'success'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `;

    // Users by plan
    const usersByPlan = await prisma.subscription.groupBy({
      by: ['plan'],
      where: { status: 'active' },
      _count: { plan: true },
    });

    res.json({
      stats: {
        totalUsers,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeSubscribers,
        todayArticles,
      },
      signupsByDay,
      revenueByMonth,
      usersByPlan,
      recentPayments,
      recentUsers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const where = search ? {
    OR: [
      { full_name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ],
  } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { created_at: 'desc' },
      include: { subscriptions: { where: { status: 'active' }, take: 1 } },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

// GET /api/admin/users/:id
router.get('/users/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      subscriptions: true,
      payments: { orderBy: { created_at: 'desc' } },
      watchlists: true,
      alerts: true,
      sessions: { select: { id: true, device_info: true, created_at: true, expires_at: true } },
    },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
  const { plan, role, verified } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role, verified },
    });

    if (plan) {
      await prisma.subscription.updateMany({ where: { user_id: req.params.id }, data: { status: 'expired' } });
      await prisma.subscription.create({ data: { user_id: req.params.id, plan, status: 'active' } });
    }

    await logAction(req.user.id, `Updated user ${req.params.id}`, 'user', req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  await logAction(req.user.id, `Deleted user ${req.params.id}`, 'user', req.params.id);
  res.json({ message: 'User deleted' });
});

// GET /api/admin/payments
router.get('/payments', async (req, res) => {
  const { status, plan, from, to, page = 1, limit = 20 } = req.query;
  const where = {};
  if (status) where.status = status;
  if (from || to) where.created_at = { ...(from && { gte: new Date(from) }), ...(to && { lte: new Date(to) }) };

  const [payments, total, summary] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { created_at: 'desc' },
      include: { user: { select: { full_name: true, email: true } } },
    }),
    prisma.payment.count({ where }),
    prisma.payment.aggregate({ where: { status: 'success' }, _sum: { amount: true } }),
  ]);

  res.json({ payments, total, totalRevenue: summary._sum.amount || 0 });
});

// GET /api/admin/payments/export
router.get('/payments/export', async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: { status: 'success' },
    orderBy: { created_at: 'desc' },
    include: { user: { select: { full_name: true, email: true } } },
  });

  const csv = [
    'Date,User,Email,Amount,Currency,Gateway,Transaction ID,Status',
    ...payments.map((p) =>
      `${p.created_at.toISOString()},${p.user.full_name},${p.user.email},${p.amount},${p.currency},${p.gateway},${p.transaction_id || ''},${p.status}`
    ),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=payments.csv');
  res.send(csv);
});

// GET /api/admin/reviews
router.get('/reviews', async (req, res) => {
  const reviews = await prisma.review.findMany({
    orderBy: { created_at: 'desc' },
    include: { user: { select: { full_name: true, email: true, avatar_url: true } } },
  });
  res.json(reviews);
});

// PUT /api/admin/reviews/:id/approve
router.put('/reviews/:id/approve', async (req, res) => {
  const review = await prisma.review.update({ where: { id: req.params.id }, data: { approved: true } });
  await logAction(req.user.id, `Approved review ${req.params.id}`, 'review', req.params.id);
  res.json(review);
});

// DELETE /api/admin/reviews/:id
router.delete('/reviews/:id', async (req, res) => {
  await prisma.review.delete({ where: { id: req.params.id } });
  await logAction(req.user.id, `Deleted review ${req.params.id}`, 'review', req.params.id);
  res.json({ message: 'Review deleted' });
});

// GET /api/admin/news
router.get('/news', async (req, res) => {
  const { market, sentiment, source, page = 1, limit = 20 } = req.query;
  const where = {};
  if (market) where.market = market;
  if (sentiment) where.sentiment = sentiment;
  if (source) where.source_name = { contains: source, mode: 'insensitive' };

  const [articles, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { published_at: 'desc' },
    }),
    prisma.newsArticle.count({ where }),
  ]);

  res.json({ articles, total });
});

// DELETE /api/admin/news/:id
router.delete('/news/:id', async (req, res) => {
  await prisma.newsArticle.delete({ where: { id: req.params.id } });
  await logAction(req.user.id, `Deleted article ${req.params.id}`, 'article', req.params.id);
  res.json({ message: 'Article deleted' });
});

// POST /api/admin/news (manual article)
router.post('/news', async (req, res) => {
  const { title, summary, source_name, source_url, article_url, market, sentiment, stock_symbol, sector } = req.body;
  if (!title || !article_url) return res.status(400).json({ error: 'Title and URL required' });

  const article = await prisma.newsArticle.create({
    data: { title, summary, source_name, source_url, article_url, market, sentiment, stock_symbol, sector, published_at: new Date() },
  });
  await logAction(req.user.id, `Added manual article`, 'article', article.id);
  res.json(article);
});

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  const [topStocks, topUsers, newsBySource] = await Promise.all([
    prisma.newsArticle.groupBy({
      by: ['stock_symbol'],
      where: { stock_symbol: { not: null }, published_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      _count: { stock_symbol: true },
      orderBy: { _count: { stock_symbol: 'desc' } },
      take: 10,
    }),
    prisma.user.findMany({
      orderBy: { last_login: 'desc' },
      take: 10,
      select: { id: true, full_name: true, email: true, last_login: true, country: true },
    }),
    prisma.newsArticle.groupBy({
      by: ['source_name'],
      _count: { source_name: true },
      orderBy: { _count: { source_name: 'desc' } },
      take: 10,
    }),
  ]);

  const usersByCountry = await prisma.user.groupBy({
    by: ['country'],
    _count: { country: true },
    orderBy: { _count: { country: 'desc' } },
    take: 10,
  });

  const totalUsers = await prisma.user.count();
  const paidUsers = await prisma.subscription.count({ where: { status: 'active', plan: { not: 'free' } } });

  res.json({
    topStocks,
    topUsers,
    newsBySource,
    usersByCountry,
    conversionRate: totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : 0,
  });
});

// GET /api/admin/logs
router.get('/logs', async (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  const where = search ? { action: { contains: search, mode: 'insensitive' } } : {};

  const [logs, total] = await Promise.all([
    prisma.adminLog.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { timestamp: 'desc' },
      include: { },
    }),
    prisma.adminLog.count({ where }),
  ]);

  res.json({ logs, total });
});

module.exports = router;
