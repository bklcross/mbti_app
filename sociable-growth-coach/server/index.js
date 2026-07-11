const cors = require('cors');
const express = require('express');
const { close, openDb } = require('./db');
const {
  collectQuote,
  getQuoteAnalysis,
  listQuotes
} = require('./services/quoteService');

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
let totalRequests = 0;

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use((req, res, next) => {
  totalRequests += 1;
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/echo', (req, res) => {
  const reflection = req.body?.reflection;

  if (typeof reflection !== 'string' || reflection.trim() === '') {
    return res.status(400).json({
      message: 'Please enter a reflection.',
      echo: ''
    });
  }

  return res.json({
    message: 'Reflection received',
    echo: reflection
  });
});

app.get('/api/quotes', async (req, res, next) => {
  const db = openDb();

  try {
    res.json({ quotes: listQuotes(db) });
  } catch (error) {
    next(error);
  } finally {
    await close(db);
  }
});

app.get('/api/quotes/analysis', async (req, res, next) => {
  const db = openDb();

  try {
    res.json(getQuoteAnalysis(db));
  } catch (error) {
    next(error);
  } finally {
    await close(db);
  }
});

app.post('/api/quotes/collect', async (req, res, next) => {
  const db = openDb();

  try {
    res.status(201).json({ quote: await collectQuote(db) });
  } catch (error) {
    next(error);
  } finally {
    await close(db);
  }
});

app.get('/metrics', async (req, res, next) => {
  const db = openDb();

  try {
    const analysis = getQuoteAnalysis(db);

    res.json({
      status: 'ok',
      uptime: process.uptime(),
      totalRequests,
      totalQuotes: analysis.totalQuotes,
      uniqueAuthors: analysis.uniqueAuthors,
      latestQuoteFetchedAt: analysis.latestQuote?.fetched_at || null
    });
  } catch (error) {
    next(error);
  } finally {
    await close(db);
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Sociable Growth Coach server listening on port ${PORT}`);
  });
}

module.exports = app;
