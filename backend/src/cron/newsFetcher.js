const cron = require('node-cron');
const Parser = require('rss-parser');
const { PrismaClient } = require('@prisma/client');
const { analyzeSentiment } = require('../utils/sentiment');
const { tagStockSymbol } = require('../utils/stockTagger');

const prisma = new PrismaClient();
const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'StockPulse/1.0' } });

// Top stocks for Google News RSS
const TOP_STOCKS = [
  { name: 'Reliance Industries', market: 'india', hl: 'en-IN', gl: 'IN', ceid: 'IN:en' },
  { name: 'TCS Tata Consultancy', market: 'india', hl: 'en-IN', gl: 'IN', ceid: 'IN:en' },
  { name: 'HDFC Bank', market: 'india', hl: 'en-IN', gl: 'IN', ceid: 'IN:en' },
  { name: 'Infosys stock', market: 'india', hl: 'en-IN', gl: 'IN', ceid: 'IN:en' },
  { name: 'ICICI Bank', market: 'india', hl: 'en-IN', gl: 'IN', ceid: 'IN:en' },
  { name: 'Wipro stock', market: 'india', hl: 'en-IN', gl: 'IN', ceid: 'IN:en' },
  { name: 'Tata Motors', market: 'india', hl: 'en-IN', gl: 'IN', ceid: 'IN:en' },
  { name: 'Apple AAPL stock', market: 'international', hl: 'en', gl: 'US', ceid: 'US:en' },
  { name: 'Tesla TSLA stock', market: 'international', hl: 'en', gl: 'US', ceid: 'US:en' },
  { name: 'Microsoft MSFT stock', market: 'international', hl: 'en', gl: 'US', ceid: 'US:en' },
  { name: 'NVIDIA NVDA stock', market: 'international', hl: 'en', gl: 'US', ceid: 'US:en' },
  { name: 'Amazon AMZN stock', market: 'international', hl: 'en', gl: 'US', ceid: 'US:en' },
];

const fetchFeed = async (url, sourceName, market) => {
  try {
    const feed = await parser.parseURL(url);
    return feed.items.map((item) => ({
      title: item.title?.trim(),
      summary: item.contentSnippet || item.content || item.summary || '',
      source_name: sourceName,
      source_url: feed.link || url,
      article_url: item.link || item.guid,
      published_at: item.pubDate ? new Date(item.pubDate) : new Date(),
      market,
    }));
  } catch (err) {
    console.error(`RSS fetch error [${sourceName}]:`, err.message);
    return [];
  }
};

const processAndSaveArticles = async (articles, io) => {
  let newCount = 0;

  for (const article of articles) {
    if (!article.title || !article.article_url) continue;

    const exists = await prisma.newsArticle.findUnique({ where: { article_url: article.article_url } });
    if (exists) continue;

    const sentiment = analyzeSentiment(article.title, article.summary);
    const { symbol, sector } = await tagStockSymbol(article.title, article.summary);

    await prisma.newsArticle.create({
      data: {
        title: article.title,
        summary: article.summary?.substring(0, 1000) || '',
        source_name: article.source_name,
        source_url: article.source_url,
        article_url: article.article_url,
        stock_symbol: symbol,
        market: article.market,
        sentiment,
        sector,
        published_at: article.published_at,
      },
    });
    newCount++;
  }

  return newCount;
};

const cleanOldArticles = async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const deleted = await prisma.newsArticle.deleteMany({
    where: { published_at: { lt: sevenDaysAgo } },
  });
  if (deleted.count > 0) console.log(`🗑️  Cleaned ${deleted.count} old articles`);
};

const runFetchCycle = async (io) => {
  console.log('📡 RSS fetch cycle started:', new Date().toISOString());
  let totalNew = 0;

  // Fetch from static RSS sources
  const sources = await prisma.rssSource.findMany({ where: { active: true } });
  for (const source of sources) {
    const articles = await fetchFeed(source.url, source.name, source.market);
    const count = await processAndSaveArticles(articles, io);
    totalNew += count;
  }

  // Fetch from Google News RSS for top stocks
  for (const stock of TOP_STOCKS) {
    const q = encodeURIComponent(stock.name);
    const url = `https://news.google.com/rss/search?q=${q}&hl=${stock.hl}&gl=${stock.gl}&ceid=${stock.ceid}`;
    const articles = await fetchFeed(url, 'Google News', stock.market);
    const count = await processAndSaveArticles(articles, io);
    totalNew += count;
  }

  console.log(`✅ Fetch cycle complete. New articles: ${totalNew}`);

  if (totalNew > 0 && io) {
    io.emit('new_articles', { count: totalNew });
  }

  await cleanOldArticles();
};

const setupCronJobs = (io) => {
  // Run every 10 minutes
  cron.schedule('*/10 * * * *', () => runFetchCycle(io));

  // Weekly digest — every Monday at 8am
  cron.schedule('0 8 * * 1', async () => {
    console.log('📧 Sending weekly digest...');
    // Weekly digest logic handled in email utils
  });

  // Renewal reminders — daily at 9am
  cron.schedule('0 9 * * *', async () => {
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const subs = await prisma.subscription.findMany({
      where: {
        status: 'active',
        end_date: {
          gte: new Date(),
          lte: threeDaysFromNow,
        },
        auto_renew: true,
      },
      include: { user: true },
    });

    const { sendRenewalReminderEmail } = require('../utils/email');
    for (const sub of subs) {
      await sendRenewalReminderEmail(sub.user, sub.plan, sub.end_date?.toLocaleDateString());
    }
  });

  // Run immediately on startup
  setTimeout(() => runFetchCycle(io), 5000);

  console.log('⏰ Cron jobs scheduled');
};

module.exports = { setupCronJobs, runFetchCycle };
