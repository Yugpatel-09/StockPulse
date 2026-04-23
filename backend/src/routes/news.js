const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/news
router.get('/', async (req, res) => {
  try {
    const {
      market, sentiment, sector, source, search,
      page = 1, limit = 20, stock_symbol,
    } = req.query;

    const where = {};
    if (market) where.market = market;
    if (sentiment) where.sentiment = sentiment;
    if (sector) where.sector = sector;
    if (source) where.source_name = { contains: source, mode: 'insensitive' };
    if (stock_symbol) where.stock_symbol = stock_symbol;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { stock_symbol: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 50);

    const [articles, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
        orderBy: { published_at: 'desc' },
        skip,
        take,
      }),
      prisma.newsArticle.count({ where }),
    ]);

    res.json({
      articles,
      pagination: {
        total,
        page: parseInt(page),
        limit: take,
        pages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/news/saved
router.get('/saved', authenticate, async (req, res) => {
  try {
    const saved = await prisma.savedArticle.findMany({
      where: { user_id: req.user.id },
      include: { article: true },
      orderBy: { saved_at: 'desc' },
    });
    res.json(saved.map((s) => ({ ...s.article, saved_at: s.saved_at })));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/news/:id
router.get('/:id', async (req, res) => {
  try {
    const article = await prisma.newsArticle.findUnique({ where: { id: req.params.id } });
    if (!article) return res.status(404).json({ error: 'Article not found' });

    // Related articles
    const related = await prisma.newsArticle.findMany({
      where: {
        stock_symbol: article.stock_symbol || undefined,
        id: { not: article.id },
      },
      orderBy: { published_at: 'desc' },
      take: 3,
    });

    res.json({ ...article, related });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/news/save/:id
router.post('/save/:id', authenticate, async (req, res) => {
  try {
    const article = await prisma.newsArticle.findUnique({ where: { id: req.params.id } });
    if (!article) return res.status(404).json({ error: 'Article not found' });

    await prisma.savedArticle.upsert({
      where: { user_id_article_id: { user_id: req.user.id, article_id: req.params.id } },
      update: {},
      create: { user_id: req.user.id, article_id: req.params.id },
    });

    res.json({ message: 'Article saved' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/news/save/:id
router.delete('/save/:id', authenticate, async (req, res) => {
  try {
    await prisma.savedArticle.deleteMany({
      where: { user_id: req.user.id, article_id: req.params.id },
    });
    res.json({ message: 'Article removed from saved' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
