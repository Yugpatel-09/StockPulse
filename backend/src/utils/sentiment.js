const BULLISH_KEYWORDS = [
  'surge', 'rally', 'gains', 'gain', 'rise', 'rises', 'up', 'profit', 'growth',
  'record high', 'beat', 'strong', 'bullish', 'outperform', 'upgrade', 'buy',
  'positive', 'boost', 'soar', 'jump', 'climb', 'high', 'peak', 'breakout',
  'revenue growth', 'earnings beat', 'dividend', 'expansion', 'acquisition win',
];

const BEARISH_KEYWORDS = [
  'fall', 'falls', 'drop', 'drops', 'crash', 'loss', 'losses', 'decline',
  'down', 'weak', 'miss', 'cut', 'plunge', 'bearish', 'underperform', 'sell',
  'negative', 'slump', 'tumble', 'sink', 'low', 'downgrade', 'warning',
  'revenue miss', 'earnings miss', 'layoffs', 'bankruptcy', 'debt', 'recall',
];

const analyzeSentiment = (title = '', summary = '') => {
  const text = `${title} ${summary}`.toLowerCase();

  let bullishScore = 0;
  let bearishScore = 0;

  BULLISH_KEYWORDS.forEach((kw) => { if (text.includes(kw)) bullishScore++; });
  BEARISH_KEYWORDS.forEach((kw) => { if (text.includes(kw)) bearishScore++; });

  if (bullishScore > bearishScore) return 'bullish';
  if (bearishScore > bullishScore) return 'bearish';
  return 'neutral';
};

module.exports = { analyzeSentiment };
