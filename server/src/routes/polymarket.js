import express from 'express';

const router = express.Router();

const POLYMARKET_ENDPOINTS = {
  gamma: 'https://gamma-api.polymarket.com',
  data: 'https://data-api.polymarket.com',
  clob: 'https://clob.polymarket.com'
};

router.get('/markets', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const response = await fetch(`${POLYMARKET_ENDPOINTS.gamma}/markets?closed=false&limit=${limit}`);
    const markets = await response.json();
    
    const formatted = markets.map(m => ({
      id: m.conditionID,
      question: m.question,
      description: m.description,
      volume: m.volume,
      liquidity: m.liquidity,
      startDate: m.startDate,
      endDate: m.endDate,
      image: m.image,
      slug: m.slug
    })).filter(m => m.question);

    res.json({ markets: formatted, count: formatted.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/markets/:conditionId', async (req, res) => {
  try {
    const { conditionId } = req.params;
    
    const response = await fetch(`${POLYMARKET_ENDPOINTS.gamma}/markets/${conditionId}`);
    const market = await response.json();
    
    if (!market || market.error) {
      return res.status(404).json({ error: 'Market not found' });
    }

    const pricesResponse = await fetch(`${POLYMARKET_ENDPOINTS.clob}/markets?condition_id=${conditionId}`);
    const prices = await pricesResponse.json();
    
    res.json({ market, prices });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const response = await fetch(`${POLYMARKET_ENDPOINTS.data}/markets/trending?limit=${limit}`);
    const trending = await response.json();
    
    res.json({ markets: trending, count: trending.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/prices/:conditionId', async (req, res) => {
  try {
    const { conditionId } = req.params;
    
    const response = await fetch(`${POLYMARKET_ENDPOINTS.clob}/prices?condition_id=${conditionId}`);
    const prices = await response.json();
    
    res.json({ prices });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;