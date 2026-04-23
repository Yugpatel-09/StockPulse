'use client';

const TICKER_DATA = [
  { symbol: 'RELIANCE', price: '2,847.50', change: '+1.2%', up: true },
  { symbol: 'TCS', price: '3,921.00', change: '+0.8%', up: true },
  { symbol: 'HDFCBANK', price: '1,654.30', change: '-0.4%', up: false },
  { symbol: 'INFY', price: '1,789.60', change: '+2.1%', up: true },
  { symbol: 'AAPL', price: '$189.30', change: '+0.6%', up: true },
  { symbol: 'TSLA', price: '$248.50', change: '-1.8%', up: false },
  { symbol: 'MSFT', price: '$415.20', change: '+1.4%', up: true },
  { symbol: 'NVDA', price: '$875.40', change: '+3.2%', up: true },
  { symbol: 'SBIN', price: '812.45', change: '+0.9%', up: true },
  { symbol: 'WIPRO', price: '524.80', change: '-0.3%', up: false },
  { symbol: 'GOOGL', price: '$175.60', change: '+0.7%', up: true },
  { symbol: 'META', price: '$505.30', change: '+2.3%', up: true },
  { symbol: 'TATAMOTORS', price: '1,023.70', change: '+1.5%', up: true },
  { symbol: 'AMZN', price: '$185.90', change: '-0.2%', up: false },
  { symbol: 'ICICIBANK', price: '1,245.60', change: '+0.5%', up: true },
  { symbol: 'JPM', price: '$198.40', change: '+0.3%', up: true },
];

const TickerItem = ({ symbol, price, change, up }) => (
  <span className="inline-flex items-center gap-2 px-6 text-sm">
    <span className="font-semibold text-white font-dm">{symbol}</span>
    <span className="text-slate-400">{price}</span>
    <span className={up ? 'text-green-400' : 'text-red-400'}>{change}</span>
    <span className="text-slate-700 mx-2">|</span>
  </span>
);

export default function TickerTape() {
  const doubled = [...TICKER_DATA, ...TICKER_DATA];

  return (
    <div className="w-full bg-navy-800 border-b border-slate-800 py-2 overflow-hidden">
      <div className="ticker-wrap">
        <div className="ticker-content">
          {doubled.map((item, i) => (
            <TickerItem key={i} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
