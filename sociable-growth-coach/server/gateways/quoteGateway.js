const QUOTE_API_URL = 'https://dummyjson.com/quotes/random';

function mapQuoteResponse(data) {
  return {
    quoteText: data.quote,
    author: data.author,
    sourceUrl: QUOTE_API_URL,
    fetchedAt: new Date().toISOString()
  };
}

async function fetchRandomQuote() {
  const response = await fetch(QUOTE_API_URL);

  if (!response.ok) {
    throw new Error(`Quote API request failed with status ${response.status}`);
  }

  const data = await response.json();

  return mapQuoteResponse(data);
}

module.exports = {
  fetchRandomQuote,
  mapQuoteResponse,
  QUOTE_API_URL
};
