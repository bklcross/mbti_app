const { close, openDb, run } = require('../db');
const { fetchRandomQuote } = require('../gateways/quoteGateway');

async function collectQuote() {
  const quote = await fetchRandomQuote();
  const db = openDb();

  try {
    const result = await run(
      db,
      `INSERT INTO quotes (quote_text, author, source_url, fetched_at)
       VALUES (?, ?, ?, ?)`,
      [quote.quoteText, quote.author, quote.sourceUrl, quote.fetchedAt]
    );

    console.log(`Saved quote #${result.id}: "${quote.quoteText}" - ${quote.author}`);
  } finally {
    await close(db);
  }
}

collectQuote().catch((error) => {
  console.error(error);
  process.exit(1);
});
