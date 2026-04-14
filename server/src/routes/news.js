import express from 'express';
import { getDb } from '../models/db.js';

const router = express.Router();

const negativeKeywords = ['death', 'died', 'killed', 'murder', 'accident', 'crash', 'violence', 'attack', 'terrorist', 'bomb', 'war', 'suicide', 'disaster', 'tragedy'];

function isPositiveStory(title, description) {
  const text = `${title || ''} ${description || ''}`.toLowerCase();
  return !negativeKeywords.some(keyword => text.includes(keyword));
}

router.get('/', async (req, res) => {
  try {
    const { q = 'Kenya', pageSize = 20 } = req.query;
    const apiKey = process.env.NEWS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'News API key not configured' });
    }

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&sortBy=relevancy&pageSize=${pageSize}&apiKey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'error') {
      return res.status(400).json({ error: data.message });
    }

    const articles = data.articles
      .filter(article => article.title && article.title !== '[Removed]')
      .filter(article => isPositiveStory(article.title, article.description))
      .slice(0, pageSize)
      .map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source?.name
      }));

    res.json({ articles, totalResults: articles.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'News API key not configured' });
    }

    const queries = ['Kenya', 'Nairobi', 'Kenya business', 'Kenya sports', 'Kenya politics'];
    const allArticles = [];
    
    for (const q of queries) {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&sortBy=relevancy&pageSize=10&apiKey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'ok' && data.articles) {
        allArticles.push(...data.articles);
      }
    }

    const trending = Array.from(allArticles
      .filter(article => article.title && article.title !== '[Removed]')
      .filter(article => isPositiveStory(article.title, article.description))
      .reduce((acc, article) => {
        const key = article.title.toLowerCase();
        if (!acc.has(key)) {
          acc.set(key, article);
        }
        return acc;
      }, new Map())
      .values())
      .slice(0, 15)
      .map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source?.name
      }));

    res.json({ articles: Array.from(trending), totalResults: trending.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/create-bets', async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'News API key not configured' });
    }

    const queries = ['Kenya', 'Nairobi', 'Kenya business', 'Kenya sports', 'Kenya politics', 'Kenya entertainment'];
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

    const existingMarkets = await req.db.prepare('SELECT question FROM markets').all();
    const existingQuestions = new Set(existingMarkets.map(m => m.question.toLowerCase()));

    const newMarkets = [];
    const creatorId = 1;

    for (const article of positiveArticles) {
      if (newMarkets.length >= 10) break;
      
      const title = article.title.trim();
      if (existingQuestions.has(title.toLowerCase())) continue;

      const question = title.length > 200 ? title.substring(0, 197) + '...' : title;
      
      await req.db.prepare(`
        INSERT INTO markets (creator_id, question, description, category, fee_percentage)
        VALUES (?, ?, ?, 'news', 10)
      `).run(creatorId, question, article.description || `Source: ${article.source?.name}`);
      
      newMarkets.push({ question, source: article.source?.name });
    }

    res.json({ 
      message: `Created ${newMarkets.length} markets from trending news`,
      markets: newMarkets 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;