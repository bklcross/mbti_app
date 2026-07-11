const { all, get, run } = require('../db');
const { fetchRandomQuote } = require('../gateways/quoteGateway');

function saveQuote(db, quote) {
  const result = run(
    db,
    `INSERT INTO quotes (quote_text, author, source_url, fetched_at)
     VALUES (?, ?, ?, ?)`,
    [quote.quoteText, quote.author, quote.sourceUrl, quote.fetchedAt]
  );

  return {
    id: result.id,
    quote_text: quote.quoteText,
    author: quote.author,
    source_url: quote.sourceUrl,
    fetched_at: quote.fetchedAt
  };
}

function listQuotes(db) {
  return all(
    db,
    `SELECT id, quote_text, author, source_url, fetched_at
     FROM quotes
     ORDER BY fetched_at DESC, id DESC`
  );
}

function analyzeQuoteRows(rows) {
  const authors = new Set(rows.map((quote) => quote.author).filter(Boolean));

  return {
    totalQuotes: rows.length,
    uniqueAuthors: authors.size,
    latestQuote: rows[0] || null
  };
}

function getQuoteAnalysis(db) {
  const latestQuote = get(
    db,
    `SELECT id, quote_text, author, source_url, fetched_at
     FROM quotes
     ORDER BY fetched_at DESC, id DESC
     LIMIT 1`
  );
  const totals = get(
    db,
    `SELECT
       COUNT(*) AS totalQuotes,
       COUNT(DISTINCT author) AS uniqueAuthors
     FROM quotes`
  );

  return {
    totalQuotes: totals.totalQuotes,
    uniqueAuthors: totals.uniqueAuthors,
    latestQuote: latestQuote || null
  };
}

async function collectQuote(db) {
  const quote = await fetchRandomQuote();
  return saveQuote(db, quote);
}

module.exports = {
  analyzeQuoteRows,
  collectQuote,
  getQuoteAnalysis,
  listQuotes,
  saveQuote
};
