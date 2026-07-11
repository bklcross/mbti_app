import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function App() {
  const [reflection, setReflection] = useState('');
  const [feedback, setFeedback] = useState(null);

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
    } catch (submitError) {
      setFeedback({ type: 'error', text: submitError.message });
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
      </section>
    </main>
  );
}

export default App;
