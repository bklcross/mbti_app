const cors = require('cors');
const express = require('express');
const { all, close, get, openDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

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
    const quotes = await all(
      db,
      `SELECT id, quote_text, author, source_url, fetched_at
       FROM quotes
       ORDER BY fetched_at DESC, id DESC`
    );

    res.json({ quotes });
  } catch (error) {
    next(error);
  } finally {
    await close(db);
  }
});

app.get('/api/quotes/analysis', async (req, res, next) => {
  const db = openDb();

  try {
    const totals = await get(
      db,
      `SELECT
         COUNT(*) AS totalQuotes,
         COUNT(DISTINCT author) AS uniqueAuthors
       FROM quotes`
    );
    const latestQuote = await get(
      db,
      `SELECT id, quote_text, author, source_url, fetched_at
       FROM quotes
       ORDER BY fetched_at DESC, id DESC
       LIMIT 1`
    );

    res.json({
      totalQuotes: totals.totalQuotes,
      uniqueAuthors: totals.uniqueAuthors,
      latestQuote: latestQuote || null
    });
  } catch (error) {
    next(error);
  } finally {
    await close(db);
  }
});

app.listen(PORT, () => {
  console.log(`Sociable Growth Coach server listening on port ${PORT}`);
});
