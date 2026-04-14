import express from 'express';

const router = express.Router();

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

const negativeKeywords = ['death', 'died', 'killed', 'murder', 'accident', 'crash', 'violence', 'attack', 'terrorist', 'bomb', 'war', 'suicide', 'disaster', 'tragedy'];

function isPositiveStory(title, description) {
  const text = `${title || ''} ${description || ''}`.toLowerCase();
  return !negativeKeywords.some(keyword => text.includes(keyword));
}

router.get('/price/:coinId', async (req, res) => {
  try {
    const { coinId } = req.params;
    const { vs = 'usd' } = req.query;
    
    const response = await fetch(`${COINGECKO_API}/simple/price?ids=${coinId}&vs_currencies=${vs}&include_24hr_change=true&include_24hr_vol=true`);
    const data = await response.json();
    
    if (data[coinId]) {
      res.json({
        coinId,
        price: data[coinId][vs],
        change24h: data[coinId][`${vs}_24h_change`],
        volume24h: data[coinId][`${vs}_24h_vol`],
        timestamp: Date.now()
      });
    } else {
      res.status(404).json({ error: 'Coin not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/prices', async (req, res) => {
  try {
    const { ids = 'bitcoin,ethereum,solana,dogecoin,cardano' } = req.query;
    const { vs = 'usd' } = req.query;
    
    const response = await fetch(`${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=${vs}&include_24hr_change=true&include_sparkline=false`);
    const data = await response.json();
    
    const formatted = Object.entries(data).map(([coinId, values]) => ({
      coinId,
      price: values[vs],
      change24h: values[`${vs}_24h_change`]
    }));
    
    res.json({ coins: formatted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/markets', async (req, res) => {
  try {
    const { per_page = 20, page = 1, sparkline = false } = req.query;
    
    const response = await fetch(`${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${per_page}&page=${page}&sparkline=${sparkline}`);
    const data = await response.json();
    
    const markets = data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      market_cap: coin.market_cap,
      volume: coin.total_volume,
      high_24h: coin.high_24h,
      low_24h: coin.low_24h
    }));
    
    res.json({ markets, count: markets.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/bitcoin/ohlc', async (req, res) => {
  try {
    const { days = 1 } = req.query;
    
    const response = await fetch(`${COINGECKO_API}/coins/bitcoin/ohlc?vs_currency=usd&days=${days}`);
    const data = await response.json();
    
    const ohlc = data.map(item => ({
      timestamp: item[0],
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4]
    }));
    
    res.json({ ohlc, coin: 'bitcoin', timeframe: days });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/bitcoin/chart', async (req, res) => {
  try {
    const { days = 1 } = req.query;
    
    const response = await fetch(`${COINGECKO_API}/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`);
    const data = await response.json();
    
    res.json({
      prices: data.prices,
      volumes: data.total_volumes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/news', async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'News API key not configured' });
    }

    const queries = ['Bitcoin', 'Crypto', 'Ethereum', 'Cryptocurrency'];
    const allArticles = [];
    
    for (const q of queries) {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&sortBy=relevancy&pageSize=10&apiKey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'ok' && data.articles) {
        allArticles.push(...data.articles);
      }
    }

    const positiveArticles = allArticles
      .filter(article => article.title && article.title !== '[Removed]')
      .filter(article => isPositiveStory(article.title, article.description));

    const news = positiveArticles
      .reduce((acc, article) => {
        const key = article.title.toLowerCase();
        if (!acc.has(key)) {
          acc.set(key, article);
        }
        return acc;
      }, new Map())
      .values()
      .slice(0, 10)
      .map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source?.name
      }));

    res.json({ articles: Array.from(news), count: news.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;