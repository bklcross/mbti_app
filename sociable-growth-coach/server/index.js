const cors = require('cors');
const express = require('express');

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

app.listen(PORT, () => {
  console.log(`Sociable Growth Coach server listening on port ${PORT}`);
});
