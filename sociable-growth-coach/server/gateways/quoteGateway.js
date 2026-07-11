const QUOTE_API_URL = 'https://dummyjson.com/quotes/random';

async function fetchRandomQuote() {
  const response = await fetch(QUOTE_API_URL);

  if (!response.ok) {
    throw new Error(`Quote API request failed with status ${response.status}`);
  }

  const data = await response.json();

  return {
    quoteText: data.quote,
    author: data.author,
    sourceUrl: QUOTE_API_URL,
    fetchedAt: new Date().toISOString()
  };
}

module.exports = {
  fetchRandomQuote,
  QUOTE_API_URL
};
