const { close, openDb } = require('../db');
const { collectQuote: collectAndSaveQuote } = require('../services/quoteService');

async function collectQuote() {
  const db = openDb();

  try {
    const quote = await collectAndSaveQuote(db);

    console.log(`Saved quote #${quote.id}: "${quote.quote_text}" - ${quote.author}`);
  } finally {
    await close(db);
  }
}

collectQuote().catch((error) => {
  console.error(error);
  process.exit(1);
});
