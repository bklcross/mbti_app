import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function App() {
  const [reflection, setReflection] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [submittedReflections, setSubmittedReflections] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [quoteMessage, setQuoteMessage] = useState('');

  async function loadQuotes() {
    const [quotesResponse, analysisResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/quotes`),
      fetch(`${API_BASE_URL}/api/quotes/analysis`)
    ]);

    if (!quotesResponse.ok || !analysisResponse.ok) {
      throw new Error('Unable to load quotes.');
    }

    const quotesData = await quotesResponse.json();
    const analysisData = await analysisResponse.json();

    setQuotes(quotesData.quotes);
    setAnalysis(analysisData);
  }

  useEffect(() => {
    loadQuotes().catch((error) => setQuoteMessage(error.message));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!reflection.trim()) {
      setFeedback({ type: 'error', text: 'Please enter a reflection.' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/echo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reflection: reflection.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong.');
      }

      setFeedback({ type: 'success', text: `${data.message}: ${data.echo}` });
      setSubmittedReflections((current) => [data.echo, ...current]);
      setReflection('');
    } catch (submitError) {
      setFeedback({ type: 'error', text: submitError.message });
    }
  }

  async function handleCollectQuote() {
    setQuoteMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/quotes/collect`, {
        method: 'POST'
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to collect quote.');
      }

      setQuoteMessage(`Saved quote: "${data.quote.quote_text}"`);
      await loadQuotes();
    } catch (error) {
      setQuoteMessage(error.message);
    }
  }

  return (
    <main className="page-shell">
      <section className="reflection-panel" aria-labelledby="page-title">
        <h1 id="page-title">Sociable Growth Coach</h1>
        <p className="subtitle">A personality-based personal growth reflection app.</p>

        <form className="reflection-form" onSubmit={handleSubmit}>
          <label htmlFor="reflection">How are you feeling today?</label>
          <textarea
            id="reflection"
            name="reflection"
            value={reflection}
            onChange={(event) => setReflection(event.target.value)}
            placeholder="I feel stressed about school."
            rows="5"
          />

          <button type="submit">Submit Reflection</button>
        </form>

        {feedback && <p className={`message ${feedback.type}`}>{feedback.text}</p>}

        {submittedReflections.length > 0 && (
          <section className="submitted-section" aria-labelledby="submitted-title">
            <h2 id="submitted-title">Previously submitted reflections</h2>
            <ul className="reflection-list">
              {submittedReflections.map((submittedReflection, index) => (
                <li key={`${submittedReflection}-${index}`}>{submittedReflection}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="quotes-section" aria-labelledby="quotes-title">
          <div className="section-heading">
            <h2 id="quotes-title">Quote Data Collection</h2>
            <button type="button" onClick={handleCollectQuote}>
              Collect New Quote
            </button>
          </div>

          {analysis && (
            <dl className="analysis-grid">
              <div>
                <dt>Total quotes</dt>
                <dd>{analysis.totalQuotes}</dd>
              </div>
              <div>
                <dt>Unique authors</dt>
                <dd>{analysis.uniqueAuthors}</dd>
              </div>
            </dl>
          )}

          {analysis?.latestQuote && (
            <p className="latest-quote">
              Latest quote: "{analysis.latestQuote.quote_text}" - {analysis.latestQuote.author}
            </p>
          )}

          {quoteMessage && <p className="message success">{quoteMessage}</p>}

          <ul className="quote-list">
            {quotes.map((quote) => (
              <li key={quote.id}>
                "{quote.quote_text}" <span>- {quote.author}</span>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}

export default App;
