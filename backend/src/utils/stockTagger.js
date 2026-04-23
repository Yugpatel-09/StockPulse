const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let stocksCache = null;
let cacheTime = null;

const getStocks = async () => {
  if (stocksCache && cacheTime && Date.now() - cacheTime < 10 * 60 * 1000) {
    return stocksCache;
  }
  stocksCache = await prisma.stock.findMany();
  cacheTime = Date.now();
  return stocksCache;
};

const tagStockSymbol = async (title = '', summary = '') => {
  const text = `${title} ${summary}`.toLowerCase();
  const stocks = await getStocks();

  for (const stock of stocks) {
    const nameLower = stock.name.toLowerCase();
    const symbolLower = stock.symbol.toLowerCase();

    if (text.includes(nameLower) || text.includes(symbolLower)) {
      return { symbol: stock.symbol, sector: stock.sector };
    }
  }
  return { symbol: null, sector: null };
};

module.exports = { tagStockSymbol };
