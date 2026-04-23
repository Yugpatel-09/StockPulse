const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Seed RSS Sources
  const rssSources = [
    { name: 'Economic Times Markets', url: 'https://economictimes.indiatimes.com/markets/rss.cms', market: 'india' },
    { name: 'Business Standard', url: 'https://www.business-standard.com/rss/markets-106.rss', market: 'india' },
    { name: 'MoneyControl', url: 'https://www.moneycontrol.com/rss/latestnews.xml', market: 'india' },
    { name: 'LiveMint Markets', url: 'https://www.livemint.com/rss/markets', market: 'india' },
    { name: 'Financial Express', url: 'https://www.financialexpress.com/market/feed/', market: 'india' },
    { name: 'NDTV Profit', url: 'https://feeds.feedburner.com/NdtvProfitLatestNews', market: 'india' },
    { name: 'Reuters Business', url: 'https://feeds.reuters.com/reuters/businessNews', market: 'international' },
    { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex', market: 'international' },
    { name: 'CNBC Markets', url: 'https://www.cnbc.com/id/20910258/device/rss/rss.html', market: 'international' },
    { name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories/', market: 'international' },
    { name: 'Investing.com', url: 'https://www.investing.com/rss/news.rss', market: 'international' },
    { name: 'Seeking Alpha', url: 'https://seekingalpha.com/feed.xml', market: 'international' },
  ];

  for (const source of rssSources) {
    await prisma.rssSource.upsert({
      where: { url: source.url },
      update: {},
      create: source,
    });
  }

  // Seed Stocks
  const stocks = [
    // Indian
    { symbol: 'RELIANCE', name: 'Reliance Industries', market: 'india', sector: 'Energy', exchange: 'NSE' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', market: 'india', sector: 'Technology', exchange: 'NSE' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', market: 'india', sector: 'Banking', exchange: 'NSE' },
    { symbol: 'INFY', name: 'Infosys', market: 'india', sector: 'Technology', exchange: 'NSE' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', market: 'india', sector: 'Banking', exchange: 'NSE' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', market: 'india', sector: 'FMCG', exchange: 'NSE' },
    { symbol: 'SBIN', name: 'State Bank of India', market: 'india', sector: 'Banking', exchange: 'NSE' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', market: 'india', sector: 'Telecom', exchange: 'NSE' },
    { symbol: 'WIPRO', name: 'Wipro', market: 'india', sector: 'Technology', exchange: 'NSE' },
    { symbol: 'AXISBANK', name: 'Axis Bank', market: 'india', sector: 'Banking', exchange: 'NSE' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors', market: 'india', sector: 'Automobile', exchange: 'NSE' },
    { symbol: 'MARUTI', name: 'Maruti Suzuki', market: 'india', sector: 'Automobile', exchange: 'NSE' },
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', market: 'india', sector: 'Pharma', exchange: 'NSE' },
    { symbol: 'ONGC', name: 'Oil and Natural Gas Corporation', market: 'india', sector: 'Energy', exchange: 'NSE' },
    { symbol: 'NTPC', name: 'NTPC Limited', market: 'india', sector: 'Energy', exchange: 'NSE' },
    // International
    { symbol: 'AAPL', name: 'Apple Inc', market: 'international', sector: 'Technology', exchange: 'NASDAQ' },
    { symbol: 'TSLA', name: 'Tesla Inc', market: 'international', sector: 'Automobile', exchange: 'NASDAQ' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', market: 'international', sector: 'Technology', exchange: 'NASDAQ' },
    { symbol: 'GOOGL', name: 'Alphabet Inc', market: 'international', sector: 'Technology', exchange: 'NASDAQ' },
    { symbol: 'AMZN', name: 'Amazon.com Inc', market: 'international', sector: 'E-Commerce', exchange: 'NASDAQ' },
    { symbol: 'META', name: 'Meta Platforms Inc', market: 'international', sector: 'Technology', exchange: 'NASDAQ' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', market: 'international', sector: 'Technology', exchange: 'NASDAQ' },
    { symbol: 'JPM', name: 'JPMorgan Chase', market: 'international', sector: 'Banking', exchange: 'NYSE' },
    { symbol: 'V', name: 'Visa Inc', market: 'international', sector: 'Finance', exchange: 'NYSE' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', market: 'international', sector: 'Pharma', exchange: 'NYSE' },
  ];

  for (const stock of stocks) {
    await prisma.stock.upsert({
      where: { symbol: stock.symbol },
      update: {},
      create: stock,
    });
  }

  // Seed Admin User
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  await prisma.user.upsert({
    where: { email: 'admin@stockpulse.in' },
    update: {},
    create: {
      full_name: 'StockPulse Admin',
      email: 'admin@stockpulse.in',
      password_hash: adminPassword,
      role: 'admin',
      verified: true,
      subscriptions: {
        create: { plan: 'elite', status: 'active' }
      }
    },
  });

  console.log('✅ Seed complete');
}

main().catch(console.error).finally(() => prisma.$disconnect());
